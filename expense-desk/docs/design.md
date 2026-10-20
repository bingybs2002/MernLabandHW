# My design

_Fill this in BEFORE you write code, then update it when your design changes. Keep it short: bullet
points and one diagram are enough._

## 1. The steps

Draw or list how one claim flows through your system, from `getClaim` to the result.
For each step, say who does it: **code** or **model**.

```
 getClaim (code)
→ whole-claim gates: R5 deadline, R1 over $25 with no receipt (code) ──► reject
→ fetch employee, calendar, past claims, in parallel (code)
→ extract chunks from note + receipt (model, forced tool call)
→ validate: chunks sum to the receipt, known categories, no split signals (code)
     └─ fails / unusual ──► investigateClaim agent (model loop, read tools only, turn cap)
                                  └─ returns a decision ──► joins at "combine" below
→ router: each chunk → its rule (R2/R3/R4/R7/R8/R10) (code)
→ combine: escalate > reject > partial > approve; then R6 over $500 → needs_approval (code)
→ write summary + email from the final decision, wording only (model)
→ payClaim once, only approve/partial at $500 or less (code)
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
Each step passes its result on as a return value.

What does each model call see, and what does it NOT see?
- Extraction: the note and receipt text only. It does not see the policy, calendar or past claims,
  so it cannot "decide"; it only reads.
- Agent: the claim and the read tools (`readToolSchemas`); it fetches what it needs. It never gets
  `payClaimSchema`.
- Email writer: the final decision, amount, rule ids and the employee's name. It cannot change the decision.

## 5. Safety

- Where is `payClaim` called, and what guarantees it runs at most once?
    In one place in `processClaim`, as the last step, only for approve/partial with an amount of $500
    or less. Before paying, code checks that the claim has no payment yet, and it sets the claim's
    status to processed so the same run cannot pay again.
- Can a model ever call `payClaim`? Why or why not?
    No. No model call gets `payClaimSchema`; only code calls `tools.payClaim`. A payment cannot be
    undone, so it must never depend on what a model asks for.
- What stops an agent from looping forever (turn cap, token budget)?
    A max turn count. If the agent reaches it without a decision, the result is `escalate`.
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

| Claim | Decision | Amount | Path (workflow or agent) | Right? |
| ----- | -------- | ------ | ------------------------ | ------ |
| C01   | approve (expected) | $42.50 | workflow: taxi, R10 | |
| C02   | approve (expected) | $399.00 | workflow: conference ticket, R10 (the note's "Daniel approved" is not R6) | |
| C03   | approve (expected) | $490.56 | workflow: hotel, R4 (2 nights at $245.28 with tax, trip T01 matches) | |

One thing in your first design that was wrong, and what you changed.

My first design let the model decide approve/deny and had only three outcomes, with no partial,
needs_approval or payment step. I changed it so the model only extracts facts and code applies the rules,
combines all five outcomes, and is the only thing that pays.
