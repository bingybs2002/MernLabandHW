import { type FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import type { Claim, Employee } from "../types";

type Props = { onCreated: (claim: Claim) => void; onCancel: () => void };

// Submit your own claim, to try cases the test inbox does not cover
export default function NewClaimForm({ onCreated, onCancel }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("E01");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [note, setNote] = useState("");
  const [receiptText, setReceiptText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .employees()
      .then(setEmployees)
      .catch((err: Error) => setError(err.message));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const claim = await api.createClaim({
        employeeId,
        amount: Number(amount),
        expenseDate,
        note,
        receiptText,
      });
      onCreated(claim);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form className="card new-claim" onSubmit={submit}>
      <h2>New claim</h2>
      <div className="grid">
        <label>
          Employee
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount (USD)
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          Expense date
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />
        </label>
      </div>
      <label>
        Note
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was it for?"
          required
        />
      </label>
      <label>
        Receipt text (leave empty for no receipt)
        <textarea rows={6} value={receiptText} onChange={(e) => setReceiptText(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit">Submit claim</button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
