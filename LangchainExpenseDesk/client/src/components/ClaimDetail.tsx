import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { money } from "../format";
import type { ClaimDetail as Detail, TraceEvent } from "../types";
import ReceiptView from "./ReceiptView";
import ResultCard from "./ResultCard";
import TraceTimeline from "./TraceTimeline";

type Props = { claimId: string; onChanged: () => void };

// One claim: what was submitted, the AI's decision, and the trace of how it got there
export default function ClaimDetail({ claimId, onChanged }: Props) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([api.claim(claimId), api.trace(claimId)])
      .then(([d, t]) => {
        setDetail(d);
        setTrace(t);
      })
      .catch((err: Error) => setError(err.message));
  }, [claimId]);

  useEffect(load, [load]);

  async function process() {
    setBusy(true);
    setError("");
    try {
      await api.processClaim(claimId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      load();
      onChanged();
    }
  }

  if (!detail) return <section className="detail">Loading…</section>;
  const { claim, employee, result, payments } = detail;

  return (
    <section className="detail">
      <h2>
        {claim.id} · {money(claim.amount)}
      </h2>
      <dl className="facts">
        <dt>Employee</dt>
        <dd>
          {employee
            ? `${employee.name}, ${employee.title} (${employee.department})`
            : claim.employeeId}
        </dd>
        <dt>Expense date</dt>
        <dd>{claim.expenseDate}</dd>
        <dt>Submitted</dt>
        <dd>{claim.submittedAt}</dd>
        <dt>Note</dt>
        <dd>{claim.note}</dd>
      </dl>
      <ReceiptView text={claim.receiptText} />

      <div className="actions">
        <button onClick={process} disabled={busy || payments.length > 0}>
          {payments.length > 0
            ? "Paid"
            : busy
              ? "Processing…"
              : result
                ? "Process again"
                : "Process with AI"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      {result && <ResultCard result={result} payments={payments} />}
      <TraceTimeline events={trace} />
    </section>
  );
}
