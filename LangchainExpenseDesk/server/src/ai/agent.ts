import type Anthropic from "@anthropic-ai/sdk";
import { ai } from "../llm";
import { readToolSchemas, runTool } from "../tools";
import { note } from "../trace/trace";
import type { ClaimResult } from "../types";

// ════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 PART 2: THE AGENT. The model decides the steps.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// workflow.ts calls investigateClaim for the claims it cannot handle with fixed steps (no receipt,
// chunks that do not add up, an earlier claim at the same merchant on the same day, ...).
//
//   loop (at most MAX_TURNS model calls):
//     1. call the model with the messages so far, the read tools and reportDecision
//     2. the model asked for read tools → run them with runTool, send the results back, loop again
//     3. the model called reportDecision → stop and return it
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

export async function investigateClaim(claimId: string): Promise<ClaimResult> {
  note("agent", `investigating ${claimId}`);
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Investigate expense claim ${claimId} and report your decision.` },
  ];

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    const response = await ai.messages.create({
      max_tokens: 1500,
      system: SYSTEM,
      tools: [...readToolSchemas, reportDecisionTool],
      messages,
    });
    messages.push({ role: "assistant", content: response.content });

    const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    const report = toolUses.find((b) => b.name === reportDecisionTool.name);
    if (report) {
      const input = report.input as Omit<ClaimResult, "emailToEmployee">;
      note("agent", `turn ${turn}: decided ${input.decision}`);
      // workflow.ts checks this answer and writes the email
      return { ...input, emailToEmployee: "" };
    }

    if (toolUses.length === 0) {
      if (response.stop_reason === "max_tokens") return escalate(claimId, "ran out of tokens");
      // It stopped talking without a decision: ask once more, which uses up a turn
      messages.push({ role: "user", content: "Call reportDecision with your decision now." });
      continue;
    }

    const results: Anthropic.ToolResultBlockParam[] = toolUses.map((b) => ({
      type: "tool_result",
      tool_use_id: b.id,
      content: runTool(b.name, b.input),
    }));
    messages.push({ role: "user", content: results });
  }

  note("agent", `turn cap of ${MAX_TURNS} reached → escalate`);
  return escalate(claimId, `no decision after ${MAX_TURNS} turns`);
}
