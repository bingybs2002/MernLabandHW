import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import ClaimDetail from "./components/ClaimDetail";
import ClaimList from "./components/ClaimList";
import NewClaimForm from "./components/NewClaimForm";
import type { Claim, ClaimSummary } from "./types";

export default function App() {
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  // ?claim=C04 in the URL opens that claim, so a link can point at one claim
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    new URLSearchParams(location.search).get("claim"),
  );
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadClaims = useCallback(() => {
    api
      .claims()
      .then(setClaims)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(loadClaims, [loadClaims]);

  useEffect(() => {
    history.replaceState(null, "", selectedId ? `?claim=${selectedId}` : location.pathname);
  }, [selectedId]);

  async function reset() {
    try {
      await api.reset();
      setSelectedId(null);
      loadClaims();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function created(claim: Claim) {
    setShowForm(false);
    loadClaims();
    setSelectedId(claim.id);
  }

  return (
    <div className="app">
      <header className="top">
        <h1>Expense Desk</h1>
        <button onClick={() => setShowForm(true)}>New claim</button>
        <button className="secondary" onClick={reset}>
          Reset data
        </button>
      </header>

      {error && (
        <p className="error" onClick={() => setError("")}>
          {error}
        </p>
      )}
      {showForm && <NewClaimForm onCreated={created} onCancel={() => setShowForm(false)} />}

      <main>
        <ClaimList claims={claims} selectedId={selectedId} onSelect={setSelectedId} />
        {selectedId ? (
          <ClaimDetail key={selectedId} claimId={selectedId} onChanged={loadClaims} />
        ) : (
          <section className="detail empty">Pick a claim on the left.</section>
        )}
      </main>
    </div>
  );
}
