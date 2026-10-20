# My design

_Fill this in BEFORE you write code, then update it when your design changes. Keep it short: bullet
points and one diagram are enough._

## 1. The steps

Draw or list how one claim flows through your system, from `getClaim` to the result.
For each step, say who does it: **code** or **model**.

```
getClaim (code) → ...
```

## 2. Workflow or agent?

Which claims does the workflow handle, and which go to the agent? How does the workflow decide (the
route)? Why can the workflow not handle the agent's claims with fixed steps?

| Part of the job | Workflow or agent? | Which pattern (chain, router, parallel, evaluator, agent loop)? | Why? |
| --------------- | ------------------ | --------------------------------------------------------------- | ---- |
|                 |                    |                                                                 |      |
|                 |                    |                                                                 |      |

## 3. What the model does, and what code does

- Which decisions does the model make?
- Which checks are plain code (dates, money, limits)? Why those?
- How do you get structured output from the model (for example a forced tool call)?

## 4. Data between steps

How does each step get what it needs: passed on as a return value, or a shared state object?
What does each model call see, and what does it NOT see?

## 5. Safety

- Where is `payClaim` called, and what guarantees it runs at most once?
- Can a model ever call `payClaim`? Why or why not?
- What stops an agent from looping forever (turn cap, token budget)?
- What happens when the model returns something you did not expect?

## 6. Human approval

- How does a claim wait for a manager? What status does it have?
- What happens when the manager approves, and when they reject?
- What happens if they press Approve twice?

## 7. Results on the inbox

| Claim | Decision | Amount | Path (workflow or agent) | Right? |
| ----- | -------- | ------ | ------------------------ | ------ |
| C01   |          |        |                          |        |

One thing in your first design that was wrong, and what you changed.
