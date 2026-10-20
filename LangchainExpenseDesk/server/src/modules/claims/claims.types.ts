import type { Claim, ClaimStatus, Decision, Employee, Payment, StoredResult } from "../../types";

// One row of the inbox
export type ClaimSummary = {
  id: string;
  employeeName: string;
  merchant: string;
  amount: number;
  submittedAt: string;
  status: ClaimStatus;
  decision: Decision | null;
};

export type ClaimDetail = {
  claim: Claim;
  employee: Employee | null;
  result: StoredResult | null;
  payments: Payment[];
};

export type NewClaim = {
  employeeId: string;
  amount: number;
  expenseDate: string;
  note: string;
  receiptText?: string;
};
