import type Anthropic from "@anthropic-ai/sdk";
import { db } from "../store";
import { record } from "../trace/trace";
import type { Claim, Employee, PastClaim, Payment, PolicyRule, Trip } from "../types";

// The ONLY way your AI code reaches company data. Use each tool in two ways:
//   in a workflow step, call the function:   tools.getEmployee({ employeeId: "E01" })
//   in an agent, give the model the schemas:  tools: readToolSchemas, then runTool(name, input)
// Every call is recorded in the claim's trace, whichever way you call it.

export class ToolError extends Error {}

// ── The tools ───────────────────────────────────────────────────────────

function getClaim({ claimId }: { claimId: string }): Omit<Claim, "status"> {
  const claim = db.claims.find((c) => c.id === claimId);
  if (!claim) throw new ToolError(`No claim with id ${claimId}`);
  const { status: _status, ...rest } = claim;
  return rest;
}

function getEmployee({
  employeeId,
}: {
  employeeId: string;
}): Employee & { managerName: string | null } {
  const employee = db.employees.find((e) => e.id === employeeId);
  if (!employee) throw new ToolError(`No employee with id ${employeeId}`);
  const manager = db.employees.find((e) => e.id === employee.managerId);
  return { ...employee, managerName: manager?.name ?? null };
}

const TOPICS = [
  "receipts",
  "meals",
  "alcohol",
  "hotels",
  "travel",
  "deadline",
  "approval",
  "gifts",
  "duplicates",
  "splitting",
  "covered",
];

// No topic: the whole policy. With a topic: only the rules tagged with it.
function getPolicy({ topic }: { topic?: string } = {}): PolicyRule[] {
  if (!topic) return db.policy;
  const rules = db.policy.filter((r) => r.topics.includes(topic.toLowerCase()));
  if (rules.length === 0)
    throw new ToolError(`Unknown topic "${topic}". Topics: ${TOPICS.join(", ")}`);
  return rules;
}

// Claims this employee was already paid for (not the ones waiting in the inbox)
function getPastClaims({ employeeId }: { employeeId: string }): PastClaim[] {
  return db.pastClaims.filter((p) => p.employeeId === employeeId);
}

function getTravelCalendar({ employeeId }: { employeeId: string }): Trip[] {
  return db.trips.filter((t) => t.employeeId === employeeId);
}

// Sends money. Like a real payment API it is NOT idempotent: call it twice and the employee is paid twice.
function payClaim({ claimId, amount }: { claimId: string; amount: number }): Payment {
  const claim = db.claims.find((c) => c.id === claimId);
  if (!claim) throw new ToolError(`No claim with id ${claimId}`);
  if (!(amount > 0)) throw new ToolError("amount must be more than 0");
  if (amount > claim.amount + 0.001)
    throw new ToolError(`amount ${amount} is more than the claim (${claim.amount})`);
  const payment: Payment = {
    id: `PAY-${db.payments.length + 1}`,
    claimId,
    amount: Math.round(amount * 100) / 100,
    paidAt: new Date().toISOString(),
  };
  db.payments.push(payment);
  return payment;
}

// ── Tracing: every tool records its input and output ────────────────────

function traced<F extends (input: any) => unknown>(name: string, fn: F): F {
  return ((input?: unknown) => {
    try {
      const output = fn(input);
      record({ kind: "tool", name, input, output: JSON.stringify(output).slice(0, 2000) });
      return output;
    } catch (err) {
      record({ kind: "tool", name, input, output: "", error: (err as Error).message });
      throw err;
    }
  }) as F;
}

export const tools = {
  getClaim: traced("getClaim", getClaim),
  getEmployee: traced("getEmployee", getEmployee),
  getPolicy: traced("getPolicy", getPolicy),
  getPastClaims: traced("getPastClaims", getPastClaims),
  getTravelCalendar: traced("getTravelCalendar", getTravelCalendar),
  payClaim: traced("payClaim", payClaim),
};

export type ToolName = keyof typeof tools;

// ── Schemas, for when a model should choose the tools ───────────────────

const idInput = (key: string, example: string): Anthropic.Tool.InputSchema => ({
  type: "object",
  properties: { [key]: { type: "string", description: `For example ${example}` } },
  required: [key],
});

// Everything an agent may READ. payClaim is deliberately not in this list.
export const readToolSchemas: Anthropic.Tool[] = [
  {
    name: "getClaim",
    description:
      "Get one expense claim: employee id, amount asked for, dates, the employee's note, and the receipt text.",
    input_schema: idInput("claimId", "C01"),
  },
  {
    name: "getEmployee",
    description: "Get an employee: name, title, department, home city, and their manager.",
    input_schema: idInput("employeeId", "E01"),
  },
  {
    name: "getPolicy",
    description: `Get the expense policy rules (R1 to R10). Without a topic, returns every rule. Topics: ${TOPICS.join(", ")}.`,
    input_schema: { type: "object", properties: { topic: { type: "string" } } },
  },
  {
    name: "getPastClaims",
    description:
      "Get the claims this employee was already paid for: merchant, dates, amount, receipt number.",
    input_schema: idInput("employeeId", "E01"),
  },
  {
    name: "getTravelCalendar",
    description: "Get this employee's work trips: city, first and last day, purpose.",
    input_schema: idInput("employeeId", "E01"),
  },
];

// Think hard before giving this one to a model: it sends money.
export const payClaimSchema: Anthropic.Tool = {
  name: "payClaim",
  description: "Pay a claim. Sends money to the employee. Calling it twice pays twice.",
  input_schema: {
    type: "object",
    properties: { claimId: { type: "string" }, amount: { type: "number" } },
    required: ["claimId", "amount"],
  },
};

// Run a tool the model asked for. Returns text for a tool_result block; errors come back as text too,
// so the model can read them and try again.
export function runTool(name: string, input: unknown): string {
  const tool = tools[name as ToolName] as ((input: unknown) => unknown) | undefined;
  if (!tool) return `Error: there is no tool called ${name}`;
  try {
    return JSON.stringify(tool(input ?? {}));
  } catch (err) {
    return `Error: ${(err as Error).message}`;
  }
}
