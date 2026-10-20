import { tools } from "../tools";
import type { ClaimResult } from "../types";
import { investigateClaim } from "./agent";

// ════════════════════════════════════════════════════════════════════════════════════════════════
// 🛤️ PART 1: THE WORKFLOW. Your code decides every step.
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// The app calls processClaim when someone presses "Process with AI". Every claim starts here.
//
// Most claims are routine (a taxi, a hotel on a known trip, a dinner with wine on the bill). You
// know the steps for those in advance, so write them as a workflow: checks in plain code, and model
// calls only where you need judgment, with structured output (for example a forced tool call).
//
// Some claims are unusual (a dinner that looks split into small claims, a hotel with no trip). You
// cannot write their steps in advance. Hand those to the agent in agent.ts.
//
// What you have:  tools (src/tools)   ai.messages.create (src/llm.ts)   note() (src/trace/trace.ts)
// Rules: follow the policy (tools.getPolicy()), pay approve/partial claims once with tools.payClaim,
// and NEVER pay a needs_approval claim here: a manager approves it first.

export async function processClaim(claimId: string): Promise<ClaimResult> {
  const claim = tools.getClaim({ claimId });

  // TODO 1. Checks in plain code: anything the policy decides without judgment (dates, receipts, ...)

  // TODO 2. Route: is this claim routine or unusual? (plain code, or one model call: a router)

  // TODO 3. Unusual → let the agent investigate it:
  //   return investigateClaim(claimId);
  void investigateClaim;

  // TODO 4. Routine → decide with fixed steps, apply the $500 rule, then pay in code.

  return {
    decision: "escalate",
    approvedAmount: 0,
    ruleIds: [],
    summary: `Not implemented yet: claim ${claim.id} was sent to Finance.`,
    emailToEmployee: "",
  };
}
