import { DECISION_LABELS } from "../format";
import type { ClaimStatus, Decision } from "../types";

// One coloured pill: the decision when there is one, otherwise the claim's status
export default function DecisionBadge({
  decision,
  status,
}: {
  decision: Decision | null;
  status: ClaimStatus;
}) {
  if (!decision)
    return <span className="badge badge-new">{status === "new" ? "New" : status}</span>;
  return <span className={`badge badge-${decision}`}>{DECISION_LABELS[decision]}</span>;
}
