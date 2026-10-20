import { money } from "../format";
import type { ClaimSummary } from "../types";
import DecisionBadge from "./DecisionBadge";

type Props = {
  claims: ClaimSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// The inbox: every claim, newest status on the right
export default function ClaimList({ claims, selectedId, onSelect }: Props) {
  return (
    <section className="list">
      <h2>Inbox ({claims.length})</h2>
      <ul>
        {claims.map((c) => (
          <li
            key={c.id}
            className={c.id === selectedId ? "selected" : ""}
            onClick={() => onSelect(c.id)}
          >
            <div className="row">
              <strong>{c.id}</strong>
              <span>{c.employeeName}</span>
              <span className="amount">{money(c.amount)}</span>
            </div>
            <div className="row muted">
              <span className="merchant">{c.merchant}</span>
              <DecisionBadge decision={c.decision} status={c.status} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
