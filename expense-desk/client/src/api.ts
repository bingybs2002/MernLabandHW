import type {
  Claim,
  ClaimDetail,
  ClaimResult,
  ClaimSummary,
  Employee,
  NewClaim,
  TraceEvent,
} from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body as T;
}

const post = (body?: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body ?? {}),
});

// Every call from the browser to the API
export const api = {
  claims: () => request<ClaimSummary[]>("/api/claims"),
  claim: (id: string) => request<ClaimDetail>(`/api/claims/${id}`),
  trace: (id: string) => request<TraceEvent[]>(`/api/claims/${id}/trace`),
  createClaim: (input: NewClaim) => request<Claim>("/api/claims", post(input)),
  processClaim: (id: string) => request<ClaimResult>(`/api/claims/${id}/process`, post()),
  employees: () => request<Employee[]>("/api/employees"),
  reset: () => request<void>("/api/admin/reset", post()),
};
