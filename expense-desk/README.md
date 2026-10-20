# Expense Desk

An expense-claims app for a company called Brightline. The app, the data and the tools already work.
What is missing is the AI that decides each claim. You build it in two parts: a **workflow** for
the routine claims and an **AI agent** for the unusual ones. Then you add the manager approval step.

```bash
npm install
cp .env.example .env    # paste your ANTHROPIC_API_KEY
npm run dev             # API: http://localhost:3001   app: http://localhost:5173
npm run typecheck
```

## What exists today

- An inbox of 13 expense claims, a claim view with the receipt, and a "Process with AI" button.
- After processing: the decision, the amount, the rules, the email to the employee, the payments,
  and a **trace** of every model call and tool call your code made.
- A form to submit your own claims, and "Reset data" to start over.
- `server/src/ai/workflow.ts` and `server/src/ai/agent.ts` are stubs: every claim goes to Finance.

## Your tasks

### 1. Design first

Read the [business brief](docs/business-brief.md) and the [policy](docs/policy.md), then fill in
[docs/design.md](docs/design.md): the steps, which claims the workflow handles, which ones go to the
agent, and why. Show it to a classmate before you build.

### 2. The workflow: `server/src/ai/workflow.ts`

Every claim starts in `processClaim`. Your code decides every step:

- checks the policy decides without judgment, in plain code (dates, missing receipt, ...),
- a route: is this claim routine or unusual?
- routine claims: decide with fixed steps (for example one forced tool call), apply the $500 rule,
  and pay approve/partial claims once with `tools.payClaim`,
- unusual claims: hand them to the agent with `investigateClaim(claimId)`.

### 3. The agent: `server/src/ai/agent.ts`

`investigateClaim` is for the claims whose steps you cannot write in advance, like a dinner that
looks split into small claims (C10) or a hotel with no matching trip (C11). The model decides what
to look at: a loop that calls the model with the read tools, runs the tools it asks for, and stops
when it reports a decision, with a turn cap.

### 4. Manager approval (human in the loop)

A claim over $500 must not be paid by the AI. Build:

- a review queue in the app where a manager sees the claims waiting for them,
- Approve and Reject buttons, and the endpoints behind them (`POST /api/claims/:id/approve` and
  `/reject`),
- approve pays the claim exactly once, even if the manager clicks twice.

### 5. Try it on the inbox

Process all 13 claims in the app. In `docs/design.md`, write down each decision, which path it took
(workflow or agent: the trace shows it), and anything you would change.

Hand in: `docs/design.md` and your code.

### Challenges (once everything works)

- **Evaluator loop:** check the email to the employee against a short rubric (polite, names the
  rule, says the amount) and rewrite it when it fails, with a round cap.
- **Parallel checks:** run the independent checks at the same time and compare the time.
- **Crash-safe runs:** save the run's state after each step, so a crash halfway resumes instead of
  starting over (and never pays twice).
- **Your own test claims:** submit three tricky claims with the form and see which path they take.

## Rules

- Use the provided `tools` for all data and `ai.messages.create` for all model calls, so everything
  shows up in the trace. The model is always `claude-haiku-5-5`.
- Do not change `server/src/tools`, `server/src/llm.ts`, `server/src/trace` or `server/data`.
  Everything else is yours.
- Do not hard-code claim ids or answers. The system must work on claims it has not seen.

## Project map

| Path                        | What it is                                        |
| --------------------------- | ------------------------------------------------- |
| `server/src/ai/workflow.ts` | 👉 part 1: the workflow, where every claim starts |
| `server/src/ai/agent.ts`    | 👉 part 2: the agent, for the unusual claims      |
| `server/src/tools`          | the company data as tools, and `payClaim`         |
| `server/src/llm.ts`         | `ai.messages.create`, the traced model client     |
| `server/src/trace/trace.ts` | the trace, and `note()` to label your steps       |
| `server/src/modules/claims` | the claims API (routes, controller, service)      |
| `server/data`               | the seed data and the policy                      |
| `client/src`                | the React app: `App.tsx`, `api.ts`, `components/` |

More: [architecture](docs/architecture.md), [tools](docs/tools.md).
