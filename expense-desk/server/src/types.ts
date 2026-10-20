// The domain: who claims, what they claim, and the rules that decide it.

export type Employee = {
  id: string;
  name: string;
  title: string;
  department: string;
  managerId: string | null;
  homeCity: string;
};

// "new" until processClaim has run. Add your own statuses (for example for human approval).
export type ClaimStatus = "new" | "processed";

export type Claim = {
  id: string;
  employeeId: string;
  amount: number; // what the employee asks for, in USD
  expenseDate: string; // YYYY-MM-DD
  submittedAt: string; // YYYY-MM-DD
  note: string; // the employee's own words
  receiptText: string; // OCR text of the receipt, "" when there is no receipt
  status: ClaimStatus;
};

export type PastClaim = {
  id: string;
  employeeId: string;
  merchant: string;
  description: string;
  expenseDate: string;
  submittedAt: string;
  amount: number;
  receiptNumber: string | null;
  status: "paid";
};

export type Trip = {
  id: string;
  employeeId: string;
  city: string;
  from: string; // first day, YYYY-MM-DD
  to: string; // last day, YYYY-MM-DD
  purpose: string;
};

export type PolicyRule = {
  id: string; // "R1" ... "R10"
  title: string;
  topics: string[];
  text: string;
};

export type Payment = {
  id: string;
  claimId: string;
  amount: number;
  paidAt: string; // ISO timestamp
};

// ── The contract between the app and YOUR code in src/ai/ ───────────────
export type Decision = "approve" | "partial" | "reject" | "needs_approval" | "escalate";

export type ClaimResult = {
  decision: Decision;
  approvedAmount: number; // what will be paid: the full amount, a lower amount, or 0
  ruleIds: string[]; // the policy rules that decided it, for example ["R3"]
  summary: string; // one or two sentences for the finance team
  emailToEmployee: string; // the message the employee receives
};

export type StoredResult = ClaimResult & { processedAt: string };
