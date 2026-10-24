# My design

_Fill this in BEFORE you write code, then update it when your design changes. Keep it short: bullet
points and one diagram are enough._

## 1. The steps

Draw or list how one claim flows through your system, from `getClaim` to the result.
For each step, say who does it: **code** or **model**.

Built with **LangGraph**: the workflow is a `StateGraph` (one node per step, code picks every edge),
and the agent is a second, smaller `StateGraph` loop. LangChain's `ChatAnthropic` is the model, but
its client is swapped for `ai.messages.create` (`server/src/ai/langchain.ts`), so every call is traced.

```
 loadClaim: getClaim (code)
→ gates: R5 deadline, R1 over $25 with no receipt (code) ──────────────────────► email (reject)
→ fetchEmployee ‖ fetchTrips ‖ fetchPastClaims: one parallel step (code)
→ duplicateCheck: R8 receipt number already paid (code) ───────────────────────► email (reject)
     └─ no receipt ──► agent
→ extract: chunks from note + receipt (model, forced tool call via withStructuredOutput)
→ validate: chunks sum to the receipt, known categories, no split signals (code)
     └─ fails / unusual ──► agent: investigateClaim (LangGraph loop: model ⇄ read tools, turn cap)
                              → checkAgent: decision, amount ≤ claim, R6 (code) ──► email
→ applyRules: router, each chunk → its rule (R2/R3/R4/R7/R10), then
              combine: escalate > reject > partial > approve; R6 over $500 → needs_approval (code)
→ email: from the final decision, wording only (model, prompt → model → text chain)
→ pay: payClaim once, only approve/partial at $500 or less (code)

agent loop:  model ─┬─ read tools ──► tools (ToolNode) ──► model
                    ├─ reportDecision ──► decide ──► END
                    ├─ no tool call ──► nudge ──► model
                    └─ turn cap / max_tokens ──► giveUp (escalate) ──► END
```

## 2. Workflow or agent?

Which claims does the workflow handle, and which go to the agent? How does the workflow decide (the
route)? Why can the workflow not handle the agent's claims with fixed steps?

| Part of the job | Workflow or agent? | Which pattern (chain, router, parallel, evaluator, agent loop)? | Why? |
| --------------- | ------------------ | --------------------------------------------------------------- | ---- |
| R5, R1 | workflow | chain (code gate) | A late claim or a missing receipt over $25 is a reject by policy. Comparing dates and checking for an empty receipt needs no judgment, and it costs nothing. |
| Fetch employee, calendar, past claims | workflow | parallel | independent lookups, so they are faster together |
| Break note + receipt into chunks | workflow | chain | Reading the OCR text needs the model, but one forced tool call is enough |
| Pick a rule for each chunk | workflow | router (code) | category → rule is a fixed table |
| Combine + R6 + pay | workflow | chain (code) | money and payClaim must be deterministic and run once |
| Chunks don't add up, split signals (same merchant/date as other claims, amounts just under $25), unknown category | agent | agent loop | We cannot know in advance which claims or trips to compare, so the model chooses which read tools to call. It returns a decision with reasons; when it is unsure it returns `escalate` so Finance looks at it. |

## 3. What the model does, and what code does

- Which decisions does the model make?
    In the workflow, none: the model only extracts chunks (category, amount, date, guests, receipt
    number) and writes the summary and email for a decision code already made. In the agent, the
    model decides the unusual claims, and code still checks its answer (amount, R6) before anything is paid.
- Which checks are plain code (dates, money, limits)? Why those?
    Dates, money and limits are all plain code checks (R5 60 days, R1 $25, R2 $75 per person, R4 $250
    per night with tax, R6 over $500, R8 receipt number match). These are deterministic comparisons;
    a model can get arithmetic wrong or be talked around by the note.
- How do you get structured output from the model (for example a forced tool call)?
    A forced tool call: `tool_choice: { type: "tool", name: "..." }` with a JSON schema for the chunks
    (and one for the agent's final decision). Code then validates the fields before using them.

## 4. Data between steps

How does each step get what it needs: passed on as a return value, or a shared state object?
A shared state object (LangGraph's graph state). Each node reads the fields it needs and returns only
the fields it sets (`claim`, `employee`, `trips`, `pastClaims`, `extraction`, `agentReason`,
`agentResult`, `outcome`, `emailToEmployee`, `paymentId`); the edges read the state to pick the next
node. The agent has its own state: the message history, a turn count and its result. The workflow
only sees the agent's final result, never its messages.

What does each model call see, and what does it NOT see?
- Extraction: the note and receipt text only. It does not see the policy, calendar or past claims,
  so it cannot "decide"; it only reads.
- Agent: the claim and the read tools (`readToolSchemas`); it fetches what it needs. It never gets
  `payClaimSchema`.
- Email writer: the final decision, amount, rule ids and the employee's name. It cannot change the decision.

## 5. Safety

- Where is `payClaim` called, and what guarantees it runs at most once?
    In one place: the graph's `pay` node, the last node, only for approve/partial with an amount of
    $500 or less. Before paying, the claims service checks that the claim has no payment yet, an
    in-flight set stops a second click while a run is going, and the node skips paying if the state
    already has a `paymentId`.
- Can a model ever call `payClaim`? Why or why not?
    No. Only the read tools are wrapped as LangChain tools; `payClaim` never is, and only code calls
    `tools.payClaim`. A payment cannot be undone, so it must never depend on what a model asks for.
- What stops an agent from looping forever (turn cap, token budget)?
    A max turn count kept in the agent's state, plus LangGraph's `recursionLimit` as a backstop. If
    the agent hits either without a decision, the result is `escalate`.
- What happens if a run crashes halfway? (crash-safe challenge)
    A LangGraph `MemorySaver` checkpoints the state after every node, one thread per claim. If a node
    throws (for example the model API is down), the next "Process with AI" resumes from that node
    instead of starting over: the trace shows a `resume` note and the earlier steps don't run again.
    Paying is the last node, so a resumed run can't pay twice. "Reset data" clears the saved runs.
    (In memory only: a server restart loses them, like the rest of the data.)
- What happens when the model returns something you did not expect?
    Missing fields, an unknown category, chunks that don't add up or an amount above the claim go to the agent;
    a bad answer from the agent becomes `escalate` (Finance looks at it). Never a payment.

## 6. Human approval

- How does a claim wait for a manager? What status does it have?
    The workflow returns `needs_approval` with the amount to pay and does not pay. The claim gets a new
    status, `awaiting_approval`, and shows in the manager's review queue with the AI's summary.
- What happens when the manager approves, and when they reject?
    Approve (`POST /api/claims/:id/approve`): code pays the approved amount once with `payClaim`,
    sets the status to `paid`, and emails the employee. Reject (`/reject`): no payment, status
    `rejected`, and an email to the employee.
- What happens if they press Approve twice?
    The approve endpoint first checks that the status is still `awaiting_approval` and that no payment
    exists for the claim. It changes the status before paying, so a second click gets an error
    and pays nothing.

## 7. Results on the inbox

Run on the LangGraph version (`processClaim` → `StateGraph`). Payments: one each for C01–C06, none
for the rest.

| Claim | Decision       | Amount    | Rules      | Path                                              |
| ----- | -------------- | --------- | ---------- | ------------------------------------------------- |
| C01   | approve        | $42.50    | R10        | workflow                                          |
| C02   | approve        | $399.00   | R10        | workflow                                          |
| C03   | approve        | $490.56   | R4         | workflow                                          |
| C04   | partial        | $138.00   | R3         | workflow                                          |
| C05   | partial        | $75.00    | R2         | workflow                                          |
| C06   | partial        | $108.00   | R1         | workflow                                          |
| C07   | reject         | $0        | R5         | workflow (gates: deadline)                        |
| C08   | reject         | $0        | R1         | workflow (gates: no receipt)                      |
| C09   | reject         | $0        | R8         | workflow (duplicateCheck: receipt already paid)   |
| C10   | escalate       | $0        | R9, R2, R1 | agent (no receipt; split dinner)                  |
| C11   | escalate       | $0        | R4         | workflow (hotel night matches no trip)            |
| C12   | needs_approval | $1,240.00 | R10, R6    | workflow (over $500: not paid, waits for manager) |
| C13   | escalate       | $0        | R7         | workflow (gift / cash equivalent)                 |
                                                                                          
One thing in your first design that was wrong, and what you changed.

My first design let the model decide approve/deny and had only three outcomes, with no partial,
needs_approval or payment step. I changed it so the model only extracts facts and code applies the rules,
combines all five outcomes, and is the only thing that pays.
