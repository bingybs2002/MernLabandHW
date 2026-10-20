import { readFileSync } from "node:fs";
import type { Claim, Employee, PastClaim, Payment, PolicyRule, StoredResult, Trip } from "./types";

// An in-memory "database", loaded from server/data/*.json. Everything resets when the server restarts
// (or when you press "Reset data" in the app). Read it through src/tools, not directly, so your AI's
// tool use shows up in the trace.

const DATA_DIR = new URL("../data/", import.meta.url);

function load<T>(file: string): T {
  return JSON.parse(readFileSync(new URL(file, DATA_DIR), "utf8")) as T;
}

type Store = {
  employees: Employee[];
  policy: PolicyRule[];
  trips: Trip[];
  pastClaims: PastClaim[];
  claims: Claim[];
  results: Map<string, StoredResult>; // claimId → the last result of processClaim
  payments: Payment[];
};

export const db: Store = {
  employees: [],
  policy: [],
  trips: [],
  pastClaims: [],
  claims: [],
  results: new Map(),
  payments: [],
};

export function resetStore() {
  db.employees = load("employees.json");
  db.policy = load("policy.json");
  db.trips = load("trips.json");
  db.pastClaims = load("past-claims.json");
  db.claims = load("claims.json");
  db.results = new Map();
  db.payments = [];
}

resetStore();
