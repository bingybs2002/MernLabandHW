import type Anthropic from "@anthropic-ai/sdk";
import { ai } from "../llm";
import { tools } from "../tools";
import { note } from "../trace/trace";
import type { ClaimResult, Decision, Employee, PastClaim, Trip } from "../types";
import { investigateClaim } from "./agent";

// ════════════════════════════════════════════════════════════════════════════════════════════════
// 🛤️ PART 1: THE WORKFLOW. Your code decides every step.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// The flow (see docs/design.md, section 1):
//   getClaim → gates (R5, R1) → fetch context → R8 receipt number → extract chunks (model)
//   → validate (unusual → agent) → rule per chunk (code) → combine + R6 → email (model) → pay once
//
// The model never decides here: it only reads the note and receipt into chunks, and words the email.
// Only this file calls payClaim, in one place, at the very end.

type Claim = ReturnType<typeof tools.getClaim>;
type Context = { claim: Claim; employee: Employee; trips: Trip[]; pastClaims: PastClaim[] };
type Outcome = { decision: Decision; approvedAmount: number; ruleIds: string[]; summary: string };

const DEADLINE_DAYS = 60;
const RECEIPT_LIMIT = 25;
const MEAL_CAP_PER_PERSON = 75;
const HOTEL_CAP_PER_NIGHT = 250;
const APPROVAL_LIMIT = 500;

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
  const claim = tools.getClaim({ claimId });

  // 1. Whole-claim gates, plain code
  const gate = checkGates(claim);
  if (gate) {
    note("gate", gate.summary);
    return finish(claim, null, gate);
  }

  // 2. Context, fetched together: these lookups do not depend on each other. (The lab's tools are
  //    synchronous, so this only becomes truly parallel with a real async data source.)
  const [employee, trips, pastClaims] = await Promise.all([
    Promise.resolve(tools.getEmployee({ employeeId: claim.employeeId })),
    Promise.resolve(tools.getTravelCalendar({ employeeId: claim.employeeId })),
    Promise.resolve(tools.getPastClaims({ employeeId: claim.employeeId })),
  ]);
  const ctx: Context = { claim, employee, trips, pastClaims };

  // 3. R8: the same receipt number was already paid
  const duplicate = pastClaims.find((p) => p.receiptNumber && claim.receiptText.includes(p.receiptNumber));
  if (duplicate) {
    note("gate", `receipt ${duplicate.receiptNumber} already paid in ${duplicate.id} → reject`);
    return finish(claim, employee, {
      decision: "reject",
      approvedAmount: 0,
      ruleIds: ["R8"],
      summary: `Receipt ${duplicate.receiptNumber} was already paid in claim ${duplicate.id} (R8).`,
    });
  }

  // 4. No receipt to read (allowed under $25): nothing to check the amount against
  if (!claim.receiptText.trim()) {
    return toAgent(ctx, "no receipt to check the amount against");
  }

  // 5. The model reads the note and receipt into chunks
  const extraction = await extractChunks(claim);
  const problem = validate(ctx, extraction);
  if (problem || !extraction) return toAgent(ctx, problem ?? "extraction failed");

  // 6. Each chunk goes to its rule, then the results are combined
  const outcome = applyRules(ctx, extraction);
  return finish(claim, employee, outcome);
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

async function extractChunks(claim: Claim): Promise<Extraction | null> {
  note("extract", "model reads the note and receipt into chunks");
  const response = await ai.messages.create({
    max_tokens: 1500,
    system: EXTRACT_SYSTEM,
    tools: [extractTool],
    tool_choice: { type: "tool", name: extractTool.name },
    messages: [
      {
        role: "user",
        content: `Expense date: ${claim.expenseDate}\nEmployee's note: ${claim.note}\n\nReceipt:\n${claim.receiptText}`,
      },
    ],
  });
  const block = response.content.find((b) => b.type === "tool_use");
  return block?.type === "tool_use" ? (block.input as Extraction) : null;
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

// ── The agent: its answer is checked here before anything else happens ─

async function toAgent(ctx: Context, reason: string): Promise<ClaimResult> {
  note("route", `unusual → agent: ${reason}`);
  const result = await investigateClaim(ctx.claim.id);
  return finish(ctx.claim, ctx.employee, checkAgentResult(ctx.claim, result));
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

// ── Finish: the email, then the one payment ─────────────────────────────

async function finish(claim: Claim, employee: Employee | null, outcome: Outcome): Promise<ClaimResult> {
  const emailToEmployee = await writeEmail(claim, employee, outcome);

  if ((outcome.decision === "approve" || outcome.decision === "partial") && outcome.approvedAmount > 0) {
    const payment = tools.payClaim({ claimId: claim.id, amount: outcome.approvedAmount });
    note("pay", `${payment.id}: $${payment.amount.toFixed(2)}`);
  }
  return { ...outcome, emailToEmployee };
}

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

async function writeEmail(claim: Claim, employee: Employee | null, o: Outcome): Promise<string> {
  const name = employee?.name.split(" ")[0] ?? "there";
  const fallback = `Hi ${name},\n\nYour claim ${claim.id} for $${claim.amount.toFixed(2)}: ${WHAT_HAPPENS[o.decision]}` +
    `${o.approvedAmount > 0 ? ` ($${o.approvedAmount.toFixed(2)})` : ""}. ${o.summary}\n\nBrightline Finance`;
  try {
    const response = await ai.messages.create({
      max_tokens: 400,
      system: EMAIL_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            `Employee first name: ${name}`,
            `Claim ${claim.id}: "${claim.note}", $${claim.amount.toFixed(2)} claimed`,
            `Decision: ${o.decision} (${WHAT_HAPPENS[o.decision]})`,
            `Amount to pay: $${o.approvedAmount.toFixed(2)}`,
            `Reasons: ${o.summary}`,
          ].join("\n"),
        },
      ],
    });
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    return text || fallback;
  } catch (err) {
    note("email", `model call failed, using the template: ${(err as Error).message}`);
    return fallback;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
