import type { ClaimResult } from "../types";

// ════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 PART 2: THE AGENT. The model decides the steps.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// workflow.ts calls investigateClaim for the claims it cannot handle with fixed steps. Here you do
// not write the steps. You give the model the goal and the tools, and it decides what to look at
// next, based on what it just found:
//
//   loop (with a turn cap):
//     1. call the model with the messages so far and the tools (readToolSchemas from src/tools,
//        plus a tool the model calls to report its decision)
//     2. the model asked for tools → run them with runTool, send the results back, loop again
//     3. the model reported its decision → stop and return it as a ClaimResult
//
// Think about: should the agent be able to pay (payClaimSchema)? What happens at the turn cap?

export async function investigateClaim(claimId: string): Promise<ClaimResult> {
  // TODO: the agent loop

  return {
    decision: "escalate",
    approvedAmount: 0,
    ruleIds: [],
    summary: `Agent not implemented yet: claim ${claimId} was sent to Finance.`,
    emailToEmployee: "",
  };
}
