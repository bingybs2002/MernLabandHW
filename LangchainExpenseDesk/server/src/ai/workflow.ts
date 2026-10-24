import type Anthropic from "@anthropic-ai/sdk";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { OutputParserException, StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { tools } from "../tools";
import { note } from "../trace/trace";
import type { ClaimResult, Decision, Employee, PastClaim, Trip } from "../types";
import { investigateClaim } from "./agent";
import { chatModel } from "./langchain";

// ════════════════════════════════════════════════════════════════════════════════════════════════
// 🛤️ PART 1: THE WORKFLOW. Your code decides every step.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// The flow (see docs/design.md, section 1), as a LangGraph StateGraph:
//
//   loadClaim → gates ─┬─ R5 / R1 ─────────────────────────────────────────────────► email
//                      └─► fetchEmployee ┐
//                          fetchTrips    ├─► duplicateCheck ─┬─ R8 ─────────────────► email
//                          fetchPastClaims┘   (in parallel)   ├─ no receipt ─► agent ─► checkAgent ─► email
//                                                             └─► extract → validate ─┬─ odd ─► agent …
//                                                                                     └─► applyRules ─► email
//   email → pay → END
//
// The model never decides here: it only reads the note and receipt into chunks, and words the email.
// Only the pay node calls payClaim, in one place, at the very end.
//
// Crash-safe: a MemorySaver checkpoints the state after every node, per claim. If a run throws halfway
// (the model API is down, ...), the next processClaim for that claim resumes from the failed node
// instead of starting over. The pay node is last, and the claims service refuses a claim that has a
// payment, so a resumed run cannot pay twice.

type Claim = ReturnType<typeof tools.getClaim>;
type Context = { claim: Claim; employee: Employee; trips: Trip[]; pastClaims: PastClaim[] };
type Outcome = { decision: Decision; approvedAmount: number; ruleIds: string[]; summary: string };

const DEADLINE_DAYS = 60;
const RECEIPT_LIMIT = 25;
const MEAL_CAP_PER_PERSON = 75;
const HOTEL_CAP_PER_NIGHT = 250;
const APPROVAL_LIMIT = 500;

// ── The state every node reads from and writes to ───────────────────────

const last = <T>() => Annotation<T>({ reducer: (_, next) => next, default: () => null as T });

const ClaimState = Annotation.Root({
  claimId: Annotation<string>,
  claim: last<Claim | null>(),
  employee: last<Employee | null>(),
  trips: last<Trip[] | null>(),
  pastClaims: last<PastClaim[] | null>(),
  extraction: last<Extraction | null>(),
  agentReason: last<string | null>(), // set when the claim is unusual: why it goes to the agent
  agentResult: last<ClaimResult | null>(),
  outcome: last<Outcome | null>(),
  emailToEmployee: last<string | null>(),
  paymentId: last<string | null>(),
});
type State = typeof ClaimState.State;

// Only call this after fetchEmployee/fetchTrips/fetchPastClaims have run
const contextOf = (s: State): Context => ({
  claim: s.claim!,
  employee: s.employee!,
  trips: s.trips!,
  pastClaims: s.pastClaims!,
});

// ── Nodes ───────────────────────────────────────────────────────────────

function loadClaim(s: State) {
  return { claim: tools.getClaim({ claimId: s.claimId }) };
}

// 1. Whole-claim gates, plain code
function gates(s: State) {
  const gate = checkGates(s.claim!);
  if (gate) note("gate", gate.summary);
  return { outcome: gate };
}

// 2. Context: three nodes that LangGraph runs in the same step, because they do not depend on each
//    other. (The lab's tools are synchronous, so this only becomes truly parallel with a real async
//    data source.)
const fetchEmployee = (s: State) => ({ employee: tools.getEmployee({ employeeId: s.claim!.employeeId }) });
const fetchTrips = (s: State) => ({ trips: tools.getTravelCalendar({ employeeId: s.claim!.employeeId }) });
const fetchPastClaims = (s: State) => ({ pastClaims: tools.getPastClaims({ employeeId: s.claim!.employeeId }) });

// 3. R8: the same receipt number was already paid. 4. No receipt to read (allowed under $25): nothing
//    to check the amount against, so the agent looks.
function duplicateCheck(s: State) {
  const claim = s.claim!;
  const duplicate = s.pastClaims!.find((p) => p.receiptNumber && claim.receiptText.includes(p.receiptNumber));
  if (duplicate) {
    note("gate", `receipt ${duplicate.receiptNumber} already paid in ${duplicate.id} → reject`);
    return {
      outcome: {
        decision: "reject",
        approvedAmount: 0,
        ruleIds: ["R8"],
        summary: `Receipt ${duplicate.receiptNumber} was already paid in claim ${duplicate.id} (R8).`,
      } satisfies Outcome,
    };
  }
  if (!claim.receiptText.trim()) return { agentReason: "no receipt to check the amount against" };
  return {};
}

// 5. The model reads the note and receipt into chunks
async function extract(s: State) {
  return { extraction: await extractChunks(s.claim!) };
}

function validateNode(s: State) {
  const problem = validate(contextOf(s), s.extraction);
  return problem ? { agentReason: problem } : {};
}

// 6. Each chunk goes to its rule, then the results are combined
function applyRulesNode(s: State) {
  return { outcome: applyRules(contextOf(s), s.extraction!) };
}

// The agent: its answer is checked in the next node before anything else happens
async function agent(s: State) {
  note("route", `unusual → agent: ${s.agentReason}`);
  return { agentResult: await investigateClaim(s.claimId) };
}

function checkAgent(s: State) {
  return { outcome: checkAgentResult(s.claim!, s.agentResult!) };
}

async function email(s: State) {
  return { emailToEmployee: await writeEmail(s.claim!, s.employee, s.outcome!) };
}

// The one payment. paymentId guards a re-run of this node within the same run.
function pay(s: State) {
  const o = s.outcome!;
  if (s.paymentId || !(o.decision === "approve" || o.decision === "partial") || !(o.approvedAmount > 0)) return {};
  const payment = tools.payClaim({ claimId: s.claimId, amount: o.approvedAmount });
  note("pay", `${payment.id}: $${payment.amount.toFixed(2)}`);
  return { paymentId: payment.id };
}

// ── Edges: plain code picks the next node ───────────────────────────────

const afterGates = (s: State) => (s.outcome ? "email" : ["fetchEmployee", "fetchTrips", "fetchPastClaims"]);
const afterDuplicateCheck = (s: State) => (s.outcome ? "email" : s.agentReason ? "agent" : "extract");
const afterValidate = (s: State) => (s.agentReason ? "agent" : "applyRules");

const checkpointer = new MemorySaver();

const graph = new StateGraph(ClaimState)
  .addNode("loadClaim", loadClaim)
  .addNode("gates", gates)
  .addNode("fetchEmployee", fetchEmployee)
  .addNode("fetchTrips", fetchTrips)
  .addNode("fetchPastClaims", fetchPastClaims)
  .addNode("duplicateCheck", duplicateCheck)
  .addNode("extract", extract)
  .addNode("validate", validateNode)
  .addNode("applyRules", applyRulesNode)
  .addNode("agent", agent)
  .addNode("checkAgent", checkAgent)
  .addNode("email", email)
  .addNode("pay", pay)
  .addEdge(START, "loadClaim")
  .addEdge("loadClaim", "gates")
  .addConditionalEdges("gates", afterGates, ["email", "fetchEmployee", "fetchTrips", "fetchPastClaims"])
  .addEdge(["fetchEmployee", "fetchTrips", "fetchPastClaims"], "duplicateCheck")
  .addConditionalEdges("duplicateCheck", afterDuplicateCheck, ["email", "agent", "extract"])
  .addEdge("extract", "validate")
  .addConditionalEdges("validate", afterValidate, ["agent", "applyRules"])
  .addEdge("applyRules", "email")
  .addEdge("agent", "checkAgent")
  .addEdge("checkAgent", "email")
  .addEdge("email", "pay")
  .addEdge("pay", END)
  .compile({ checkpointer });

// ── Entry point ─────────────────────────────────────────────────────────

// Claims being processed right now: a second click while the first run is still going must not pay twice.
// (The claims service already refuses claims that have a payment.)
const inFlight = new Set<string>();

export async function processClaim(claimId: string): Promise<ClaimResult> {
  if (inFlight.has(claimId)) throw new Error(`${claimId} is already being processed`);
  inFlight.add(claimId);
  try {
    return await run(claimId);
  } finally {
    inFlight.delete(claimId);
  }
}

async function run(claimId: string): Promise<ClaimResult> {
  const config = { configurable: { thread_id: claimId } };
  const saved = await graph.getState(config);

  let final: State;
  if (saved.next.length > 0) {
    // The last run for this claim stopped halfway: carry on from the node that failed
    note("resume", `last run stopped before ${saved.next.join(", ")}; resuming from there`);
    final = await graph.invoke(null, config);
  } else {
    await checkpointer.deleteThread(claimId); // a finished run from before: start clean
    final = await graph.invoke({ claimId }, config);
  }
  return { ...final.outcome!, emailToEmployee: final.emailToEmployee ?? "" };
}

// "Reset data" puts the claims back, so saved runs no longer match them (and ids get reused)
export async function clearRuns() {
  for (const threadId of Object.keys(checkpointer.storage)) await checkpointer.deleteThread(threadId);
}

// ── Gates ───────────────────────────────────────────────────────────────

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000); // 86,400,000 ms in a day
}

function checkGates(claim: Claim): Outcome | null {
  const days = daysBetween(claim.expenseDate, claim.submittedAt);
  if (days > DEADLINE_DAYS) {
    return {
      decision: "reject",
      approvedAmount: 0,
      ruleIds: ["R5"],
      summary: `Submitted ${days} days after the expense; the limit is ${DEADLINE_DAYS} days (R5).`,
    };
  }
  if (claim.amount > RECEIPT_LIMIT && !claim.receiptText.trim()) {
    return {
      decision: "reject",
      approvedAmount: 0,
      ruleIds: ["R1"],
      summary: `$${claim.amount.toFixed(2)} claimed with no receipt; a receipt is needed over $${RECEIPT_LIMIT} (R1).`,
    };
  }
  return null;
}

// ── Extraction: the only judgment the workflow asks of the model ────────

const CATEGORIES = ["meal", "alcohol", "hotel_night", "transport", "conference", "equipment", "gift", "other"] as const;
type Category = (typeof CATEGORIES)[number];
type Chunk = { category: Category; amount: number; date: string; description: string };
type Extraction = {
  merchant: string;
  receiptTotal: number;
  guests: number;
  clientName: string | null;
  chunks: Chunk[];
};

const extractTool: Anthropic.Tool = {
  name: "reportChunks",
  description: "Report the expense broken into chunks, read from the note and the receipt.",
  input_schema: {
    type: "object",
    properties: {
      merchant: { type: "string", description: "The merchant, from the receipt's header" },
      receiptTotal: { type: "number", description: "The total the receipt says was paid" },
      guests: { type: "number", description: "How many people a meal was for (1 if not a meal)" },
      clientName: {
        type: ["string", "null"],
        description: "A client the employee hosted, only if the note names one; otherwise null",
      },
      chunks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string", enum: [...CATEGORIES] },
            amount: { type: "number" },
            date: { type: "string", description: "YYYY-MM-DD" },
            description: { type: "string" },
          },
          required: ["category", "amount", "date", "description"],
        },
      },
    },
    required: ["merchant", "receiptTotal", "guests", "clientName", "chunks"],
  },
};

const EXTRACT_SYSTEM = `You read expense receipts. Break the receipt into chunks so that the chunk amounts add up exactly to the receipt total.
- Categories: meal (food and non-alcoholic drinks), alcohol (wine, beer, spirits, cocktails), hotel_night, transport (taxi, ride share, train, flights, flight fees, parking), conference (tickets), equipment (work equipment and supplies), gift (gifts, gift cards, cash equivalents), other (anything else).
- Hotels: one hotel_night chunk per night, with that night's room AND tax together, dated the night.
- Tax and tips: add them to the chunk they belong to. If one tax line covers several items of the same category, make it its own chunk of that category.
- Dates are YYYY-MM-DD. If the receipt leaves out the year, use the year of the expense date.
- Do not judge the policy. Only report what the receipt and note say.`;

// A forced tool call: withStructuredOutput sends tool_choice for reportChunks and returns its input
const extractor = chatModel(1500).withStructuredOutput<Extraction>(extractTool, {
  name: extractTool.name,
  method: "functionCalling",
});

async function extractChunks(claim: Claim): Promise<Extraction | null> {
  note("extract", "model reads the note and receipt into chunks");
  try {
    return await extractor.invoke([
      new SystemMessage(EXTRACT_SYSTEM),
      new HumanMessage(`Expense date: ${claim.expenseDate}\nEmployee's note: ${claim.note}\n\nReceipt:\n${claim.receiptText}`),
    ]);
  } catch (err) {
    // An answer the parser cannot read: validate() sends the claim to the agent. Anything else (the API
    // is down, ...) fails this node, so a resumed run tries the extraction again.
    if (!(err instanceof OutputParserException)) throw err;
    note("extract", `could not read the model's answer: ${err.message}`);
    return null;
  }
}

// ── Validation: anything odd goes to the agent ──────────────────────────

function sameMerchant(a: string, b: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const [x, y] = [norm(a), norm(b)];
  return x.length > 0 && y.length > 0 && (x.includes(y) || y.includes(x));
}

function validate(ctx: Context, e: Extraction | null): string | null {
  if (!e || !Array.isArray(e.chunks) || e.chunks.length === 0) return "could not read the receipt into chunks";
  if (typeof e.receiptTotal !== "number" || !(e.receiptTotal > 0)) return "no receipt total";
  for (const c of e.chunks) {
    if (!CATEGORIES.includes(c.category) || typeof c.amount !== "number" || !Number.isFinite(c.amount))
      return `a chunk the code cannot read: ${JSON.stringify(c)}`;
    if (c.category === "other") return `a chunk that fits no category: ${c.description}`;
  }
  const sum = round2(e.chunks.reduce((s, c) => s + c.amount, 0));
  if (Math.abs(sum - e.receiptTotal) > 0.05)
    return `chunks add up to $${sum.toFixed(2)} but the receipt says $${e.receiptTotal.toFixed(2)}`;

  // Split signal: an already paid claim from the same merchant on the same day (R8 or R9: the agent decides)
  const sameDay = ctx.pastClaims.filter(
    (p) => p.expenseDate === ctx.claim.expenseDate && sameMerchant(p.merchant, e.merchant),
  );
  if (sameDay.length > 0)
    return `already paid on the same day at the same merchant: ${sameDay.map((p) => p.id).join(", ")}`;

  note("validate", `${e.chunks.length} chunks add up to the receipt total $${e.receiptTotal.toFixed(2)}`);
  return null;
}

// ── Rules: each chunk to its rule, in code ──────────────────────────────

type Finding = { ruleId: string; effect: "escalate" | "reject" | "reduce" | "cover"; text: string };

function onTrip(trips: Trip[], date: string) {
  return trips.find((t) => t.from <= date && date <= t.to);
}

function applyRules(ctx: Context, e: Extraction): Outcome {
  const { claim, trips } = ctx;
  const findings: Finding[] = [];
  let payable = 0;

  // Meals are capped per day, so group them by date first
  const mealsByDate = new Map<string, number>();

  for (const c of e.chunks) {
    note("router", `${c.category} $${c.amount.toFixed(2)} on ${c.date}`);
    switch (c.category) {
      case "transport":
      case "conference":
      case "equipment":
        payable += c.amount;
        findings.push({ ruleId: "R10", effect: "cover", text: `${c.description} is covered (R10).` });
        break;
      case "alcohol":
        findings.push({ ruleId: "R3", effect: "reduce", text: `$${c.amount.toFixed(2)} of alcohol removed (R3).` });
        break;
      case "gift":
        findings.push({ ruleId: "R7", effect: "escalate", text: `${c.description} is a gift or cash equivalent (R7).` });
        break;
      case "meal":
        mealsByDate.set(c.date, (mealsByDate.get(c.date) ?? 0) + c.amount);
        break;
      case "hotel_night": {
        const trip = onTrip(trips, c.date);
        if (!trip) {
          findings.push({ ruleId: "R4", effect: "escalate", text: `Hotel night ${c.date} matches no trip in the calendar (R4).` });
        } else if (c.amount > HOTEL_CAP_PER_NIGHT) {
          payable += HOTEL_CAP_PER_NIGHT;
          findings.push({ ruleId: "R4", effect: "reduce", text: `Night ${c.date} cost $${c.amount.toFixed(2)}; capped at $${HOTEL_CAP_PER_NIGHT} (R4).` });
        } else {
          payable += c.amount;
          findings.push({ ruleId: "R4", effect: "cover", text: `Night ${c.date} ($${c.amount.toFixed(2)}) is within the cap, on trip ${trip.id} to ${trip.city} (R4).` });
        }
        break;
      }
    }
  }

  for (const [date, total] of mealsByDate) {
    const trip = onTrip(trips, date);
    if (!trip && !e.clientName) {
      // Not a rejection in the decision table: when unsure, a person looks
      findings.push({ ruleId: "R2", effect: "escalate", text: `Meal on ${date} with no trip and no client named (R2).` });
      continue;
    }
    const cap = MEAL_CAP_PER_PERSON * Math.max(1, Math.round(e.guests));
    const why = trip ? `on trip ${trip.id}` : `hosting ${e.clientName}`;
    if (total > cap) {
      payable += cap;
      findings.push({ ruleId: "R2", effect: "reduce", text: `Meals on ${date} ($${total.toFixed(2)}, ${why}) capped at $${cap} (R2).` });
    } else {
      payable += total;
      findings.push({ ruleId: "R2", effect: "cover", text: `Meals on ${date} ($${total.toFixed(2)}, ${why}) are within the cap (R2).` });
    }
  }

  // R1: we pay what the receipt shows, never more than the claim
  if (e.receiptTotal < claim.amount - 0.005) {
    findings.push({ ruleId: "R1", effect: "reduce", text: `The receipt shows $${e.receiptTotal.toFixed(2)}, less than the $${claim.amount.toFixed(2)} claimed (R1).` });
  }
  payable = round2(Math.min(payable, claim.amount));

  return combine(claim, findings, payable);
}

// escalate > reject > partial > approve, then R6 on the amount left to pay
function combine(claim: Claim, findings: Finding[], payable: number): Outcome {
  const rulesFor = (effect: Finding["effect"]) => [...new Set(findings.filter((f) => f.effect === effect).map((f) => f.ruleId))];
  const text = findings.map((f) => f.text).join(" ");

  for (const effect of ["escalate", "reject"] as const) {
    if (findings.some((f) => f.effect === effect)) {
      note("combine", `${effect}: ${rulesFor(effect).join(", ")}`);
      return { decision: effect, approvedAmount: 0, ruleIds: rulesFor(effect), summary: text };
    }
  }
  if (payable <= 0) {
    note("combine", "nothing payable → escalate");
    return { decision: "escalate", approvedAmount: 0, ruleIds: [], summary: `${text} Nothing is left to pay; a person should look.` };
  }

  const partial = payable < claim.amount - 0.005;
  const outcome: Outcome = {
    decision: partial ? "partial" : "approve",
    approvedAmount: payable,
    ruleIds: partial ? rulesFor("reduce") : rulesFor("cover"),
    summary: `${text} Pay $${payable.toFixed(2)} of $${claim.amount.toFixed(2)}.`,
  };
  return applyApprovalLimit(outcome);
}

// R6: over $500 waits for the manager, whoever decided it
function applyApprovalLimit(outcome: Outcome): Outcome {
  if ((outcome.decision === "approve" || outcome.decision === "partial") && outcome.approvedAmount > APPROVAL_LIMIT) {
    note("R6", `$${outcome.approvedAmount.toFixed(2)} is over $${APPROVAL_LIMIT} → needs_approval`);
    return {
      ...outcome,
      decision: "needs_approval",
      ruleIds: [...new Set([...outcome.ruleIds, "R6"])],
      summary: `${outcome.summary} Over $${APPROVAL_LIMIT}: the manager must approve first (R6).`,
    };
  }
  note("combine", `${outcome.decision} $${outcome.approvedAmount.toFixed(2)}`);
  return outcome;
}

const DECISIONS: Decision[] = ["approve", "partial", "reject", "needs_approval", "escalate"];

function checkAgentResult(claim: Claim, r: ClaimResult): Outcome {
  const ruleIds = Array.isArray(r.ruleIds) ? r.ruleIds.filter((id) => /^R\d+$/.test(id)) : [];
  const summary = typeof r.summary === "string" ? r.summary : "";
  const amount = round2(Number(r.approvedAmount));
  const unsafe = (why: string): Outcome => {
    note("check", `agent result not usable (${why}) → escalate`);
    return { decision: "escalate", approvedAmount: 0, ruleIds, summary: `${summary} (Sent to Finance: ${why}.)`.trim() };
  };

  if (!DECISIONS.includes(r.decision)) return unsafe(`unknown decision "${r.decision}"`);
  if (r.decision === "reject" || r.decision === "escalate") return { decision: r.decision, approvedAmount: 0, ruleIds, summary };
  if (!Number.isFinite(amount) || amount <= 0) return unsafe(`amount ${r.approvedAmount}`);
  if (amount > claim.amount + 0.005) return unsafe(`amount $${amount} is more than the claim`);
  if (r.decision === "needs_approval") return { decision: r.decision, approvedAmount: amount, ruleIds, summary };

  const decision = amount < claim.amount - 0.005 ? "partial" : "approve";
  return applyApprovalLimit({ decision, approvedAmount: amount, ruleIds, summary });
}


// ── The email: wording only, from the final decision ────────────────────

const EMAIL_SYSTEM = `You write short, friendly emails to employees about their expense claim, in plain words.
Use only the facts given. Do not change the decision or the amount. Say the amount and name the rule in plain words.
No subject line. Sign off as "Brightline Finance".`;

const WHAT_HAPPENS: Record<Decision, string> = {
  approve: "the full amount will be paid",
  partial: "part of the amount will be paid",
  reject: "nothing will be paid",
  escalate: "a person on the Finance team will review the claim and get back to them",
  needs_approval: "their manager must approve it before it is paid",
};

// A chain: prompt → model → plain text
const emailChain = ChatPromptTemplate.fromMessages([
  ["system", EMAIL_SYSTEM],
  ["human", "{facts}"],
])
  .pipe(chatModel(400))
  .pipe(new StringOutputParser());

async function writeEmail(claim: Claim, employee: Employee | null, o: Outcome): Promise<string> {
  const name = employee?.name.split(" ")[0] ?? "there";
  const fallback = `Hi ${name},\n\nYour claim ${claim.id} for $${claim.amount.toFixed(2)}: ${WHAT_HAPPENS[o.decision]}` +
    `${o.approvedAmount > 0 ? ` ($${o.approvedAmount.toFixed(2)})` : ""}. ${o.summary}\n\nBrightline Finance`;
  try {
    const text = await emailChain.invoke({
      facts: [
        `Employee first name: ${name}`,
        `Claim ${claim.id}: "${claim.note}", $${claim.amount.toFixed(2)} claimed`,
        `Decision: ${o.decision} (${WHAT_HAPPENS[o.decision]})`,
        `Amount to pay: $${o.approvedAmount.toFixed(2)}`,
        `Reasons: ${o.summary}`,
      ].join("\n"),
    });
    return text.trim() || fallback;
  } catch (err) {
    note("email", `model call failed, using the template: ${(err as Error).message}`);
    return fallback;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
