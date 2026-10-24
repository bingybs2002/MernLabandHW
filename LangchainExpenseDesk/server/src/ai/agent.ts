import type Anthropic from "@anthropic-ai/sdk";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, END, GraphRecursionError, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { note } from "../trace/trace";
import type { ClaimResult } from "../types";
import { chatModel, readTools } from "./langchain";

// ════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 PART 2: THE AGENT. The model decides the steps.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// workflow.ts calls investigateClaim for the claims it cannot handle with fixed steps (no receipt,
// chunks that do not add up, an earlier claim at the same merchant on the same day, ...).
//
// A LangGraph loop (at most MAX_TURNS model calls):
//
//   START → model ─┬─ asked for read tools ──► tools ──► model
//                  ├─ called reportDecision ─► decide ──► END
//                  ├─ said nothing ──────────► nudge ──► model
//                  └─ turn cap / max_tokens ─► giveUp ──► END   (escalate)
//
// The agent never gets payClaimSchema: it returns a decision, and workflow.ts checks it and pays.
// At the turn cap, or when it stops without a decision, the claim goes to Finance.

const MAX_TURNS = 8;

const reportDecisionTool: Anthropic.Tool = {
  name: "reportDecision",
  description: "Report your final decision on the claim. Call this once, when you are done investigating.",
  input_schema: {
    type: "object",
    properties: {
      decision: { type: "string", enum: ["approve", "partial", "reject", "needs_approval", "escalate"] },
      approvedAmount: { type: "number", description: "The amount to pay; 0 for reject and escalate" },
      ruleIds: { type: "array", items: { type: "string" }, description: 'The rules that decided it, for example ["R9"]' },
      summary: { type: "string", description: "One or two sentences for the Finance team: what you found and why" },
    },
    required: ["decision", "approvedAmount", "ruleIds", "summary"],
  },
};

const SYSTEM = `You investigate unusual expense claims for Brightline's Finance team.
Use the tools to look up the claim, the policy, the employee, their travel calendar and their already paid claims.
Decide what to look at next from what you find. When you know enough, call reportDecision.

- Follow the policy rules (R1 to R10). Read them with getPolicy before deciding.
- Look for duplicates (R8) and for one expense split into several small claims (R9): compare merchant, date and amount with the paid claims.
- If more than one rule applies: escalate and reject come before partial and approve.
- You cannot pay anything; code pays after checking your decision.
- When you are not sure, decide "escalate" so a person looks. That is always better than guessing.
- You have at most ${MAX_TURNS} turns.`;

const escalate = (claimId: string, why: string): ClaimResult => ({
  decision: "escalate",
  approvedAmount: 0,
  ruleIds: [],
  summary: `The agent could not decide claim ${claimId} (${why}); sent to Finance.`,
  emailToEmployee: "",
});

const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  claimId: Annotation<string>,
  turns: Annotation<number>({ reducer: (_, next) => next, default: () => 0 }),
  result: Annotation<ClaimResult | null>({ reducer: (_, next) => next, default: () => null }),
});
type State = typeof AgentState.State;

const model = chatModel(1500).bindTools([...readTools, reportDecisionTool]);

const lastAI = (s: State) => s.messages.at(-1) as AIMessage;
const reportCall = (m: AIMessage) => m.tool_calls?.find((c) => c.name === reportDecisionTool.name);

// ── Nodes ───────────────────────────────────────────────────────────────

async function callModel(s: State) {
  const response = await model.invoke([new SystemMessage(SYSTEM), ...s.messages]);
  return { messages: [response], turns: s.turns + 1 };
}

function decide(s: State) {
  const input = reportCall(lastAI(s))!.args as Omit<ClaimResult, "emailToEmployee">;
  note("agent", `turn ${s.turns}: decided ${input.decision}`);
  // workflow.ts checks this answer and writes the email
  return { result: { ...input, emailToEmployee: "" } };
}

// It stopped talking without a decision: ask once more, which uses up a turn
function nudge() {
  return { messages: [new HumanMessage("Call reportDecision with your decision now.")] };
}

function giveUp(s: State) {
  if (lastAI(s).response_metadata?.stop_reason === "max_tokens") {
    return { result: escalate(s.claimId, "ran out of tokens") };
  }
  note("agent", `turn cap of ${MAX_TURNS} reached → escalate`);
  return { result: escalate(s.claimId, `no decision after ${MAX_TURNS} turns`) };
}

// ── Edges: code reads the model's reply and picks the next node ─────────

function afterModel(s: State) {
  const m = lastAI(s);
  if (reportCall(m)) return "decide";
  if (m.response_metadata?.stop_reason === "max_tokens" && !m.tool_calls?.length) return "giveUp";
  if (s.turns >= MAX_TURNS) return "giveUp";
  return m.tool_calls?.length ? "tools" : "nudge";
}

const graph = new StateGraph(AgentState)
  .addNode("model", callModel)
  .addNode("tools", new ToolNode(readTools))
  .addNode("nudge", nudge)
  .addNode("decide", decide)
  .addNode("giveUp", giveUp)
  .addEdge(START, "model")
  .addConditionalEdges("model", afterModel, ["tools", "nudge", "decide", "giveUp"])
  .addEdge("tools", "model")
  .addEdge("nudge", "model")
  .addEdge("decide", END)
  .addEdge("giveUp", END)
  // Read-only, so it is safe to start over: it does not share the workflow's checkpoints
  .compile({ checkpointer: false });

export async function investigateClaim(claimId: string): Promise<ClaimResult> {
  note("agent", `investigating ${claimId}`);
  try {
    const final = await graph.invoke(
      { claimId, messages: [new HumanMessage(`Investigate expense claim ${claimId} and report your decision.`)] },
      // Each turn is two steps (model, tools); this is only a backstop behind MAX_TURNS
      { recursionLimit: MAX_TURNS * 2 + 4 },
    );
    return final.result ?? escalate(claimId, "the loop ended without a decision");
  } catch (err) {
    if (err instanceof GraphRecursionError) return escalate(claimId, "step limit reached");
    throw err;
  }
}
