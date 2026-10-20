import type { Decision } from "./types";

export const money = (n: number) => `$${n.toFixed(2)}`;

export const tokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export const DECISION_LABELS: Record<Decision, string> = {
  approve: "Approved",
  partial: "Partly approved",
  reject: "Rejected",
  needs_approval: "Needs manager approval",
  escalate: "Sent to Finance",
};
