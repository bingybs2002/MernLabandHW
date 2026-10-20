# How the app is built

```
expense-desk/
  server/                      Express + TypeScript API on :3001
    data/*.json                the seed data: employees, trips, past claims, the inbox, the policy
    src/
      ai/workflow.ts           👉 YOUR CODE, part 1: processClaim(claimId), the workflow
      ai/agent.ts              👉 YOUR CODE, part 2: investigateClaim(claimId), the agent
      tools/                   the company data as tools (functions + schemas), auto-traced
      llm.ts                   ai.messages.create(...): the Anthropic SDK call, auto-traced
      trace/trace.ts           records every model and tool call per claim; note() for your labels
      modules/claims/          routes → controller → service for /api/claims
      modules/employees/       /api/employees
      store.ts                 the in-memory "database", re-seeded on restart or reset
      types.ts                 Claim, Employee, ClaimResult, ... (the contract)
  client/                      React + Vite on :5173 (forwards /api to :3001)
    src/
      App.tsx                  the page: inbox on the left, one claim on the right
      api.ts                   every call from the browser to the API
      types.ts                 the same types as the server
      format.ts                money, token counts, decision labels
      components/              ClaimList, ClaimDetail, ResultCard, TraceTimeline, NewClaimForm, ...
  docs/                        business brief, policy, tools, architecture, your design.md
```

## What happens when you press "Process with AI"

```
ClaimDetail  →  api.processClaim(id)  →  POST /api/claims/:id/process
  → claims.service.processClaimById
      → refuses if the claim is already paid (409)
      → runWithTrace(id, () => processClaim(id))     ← your workflow.ts runs here (and agent.ts if it hands off)
            your code calls tools.* and ai.messages.create(...), and both record into the trace
      → checks the shape of your ClaimResult
      → stores it, sets the claim's status to "processed"
  ← the result; the page reloads the claim and GET /api/claims/:id/trace
```

## The API

| Method and path                | What it does                                                                |
| ------------------------------ | --------------------------------------------------------------------------- |
| `GET /api/claims`              | the inbox: one summary per claim                                            |
| `POST /api/claims`             | submit a new claim `{ employeeId, amount, expenseDate, note, receiptText }` |
| `GET /api/claims/:id`          | one claim with its employee, the last result, and its payments              |
| `POST /api/claims/:id/process` | run your `processClaim` on it                                               |
| `GET /api/claims/:id/trace`    | the trace of the last run                                                   |
| `GET /api/employees`           | everyone at Brightline                                                      |
| `POST /api/admin/reset`        | put all data back as it was                                                 |

You will add the endpoints for manager approval: `POST /api/claims/:id/approve` and `/reject`.

## Conventions

- Server: one folder per module with `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.types.ts`.
  Controllers only read the request and send the response; services hold the logic.
- Client: `api.ts` is the only file that calls `fetch`. One component per file, props typed at the
  top. Shared types live in `types.ts`.
- Errors: throw `NotFoundError`, `ValidationError`, `ConflictError` from `src/errors.ts`; the error
  handler turns them into `{ error }` JSON with the right status.
