import { money } from "../format";
import type { ClaimResult, Payment } from "../types";
import DecisionBadge from "./DecisionBadge";

type Props = { result: ClaimResult; payments: Payment[] };

// What processClaim decided, and what was actually paid
export default function ResultCard({ result, payments }: Props) {
  return (
    <div className="card result">
      <div className="row">
        <DecisionBadge decision={result.decision} status="processed" />
        <strong>{money(result.approvedAmount)}</strong>
        {result.ruleIds.length > 0 && (
          <span className="muted">Rules: {result.ruleIds.join(", ")}</span>
        )}
      </div>
      <p>{result.summary}</p>
      {result.emailToEmployee && (
        <details>
          <summary>Email to the employee</summary>
          <p className="email">{result.emailToEmployee}</p>
        </details>
      )}
      <p className="muted">
        Payments:{" "}
        {payments.length === 0
          ? "none"
          : payments.map((p) => `${p.id} ${money(p.amount)}`).join(", ")}
      </p>
    </div>
  );
}
