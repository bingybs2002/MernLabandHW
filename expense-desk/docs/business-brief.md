# Business brief: the expense desk

_From Sofia Rossi, Finance Reviewer at Brightline_

## The problem

Every week about 400 expense claims land in our inbox. Two of us read every one by hand: we open the
receipt, check it against the policy, look up the employee's trips and past claims, then pay it,
reject it, or chase someone. It takes most of our week, and we still make mistakes, mostly on the
tricky ones.

Most claims are boring: a taxi, a train ticket, a conference pass. A few are not:

- someone forgot to take the wine off a client dinner,
- a hotel shows up for dates when nobody was traveling,
- the same dinner appears three times as three small claims,
- a laptop costs more than anyone should approve alone.

We want an AI system that handles the boring ones on its own, catches the tricky ones, and never
pays money it should not.

## What the system must do

For each claim, decide one of five outcomes and explain it (see [policy.md](policy.md)):

| Outcome                | Meaning for us                                                                |
| ---------------------- | ----------------------------------------------------------------------------- |
| Approve                | Pay it in full                                                                |
| Partly approve         | Pay part of it (alcohol removed, a cap applied, receipt lower than the claim) |
| Reject                 | Pay nothing; the policy is clear                                              |
| Send to Finance        | A person on my team must look: something is unusual or the policy says so     |
| Needs manager approval | Fine by policy, but over $500: the employee's manager must say yes first      |

For every decision we need:

1. **The amount to pay**, to the cent.
2. **The rule numbers** that decided it (R1 to R10), so we can audit it later.
3. **A short summary** for my team, and **an email** to the employee in plain, friendly words.
4. **The payment itself**, sent once, only when the decision allows it.

## What we care about

- **Never pay what we should not.** A wrong payment costs us real money and an awkward email.
  Anything over $500 waits for the manager, always.
- **Explain every decision.** "The AI said so" is not an answer for an auditor.
- **Cheap and fast on the boring claims.** Most of our 400 claims a week are simple. They should cost
  a few cents and take a few seconds each.
- **Careful on the tricky ones.** Spending more time and tokens on an unusual claim is fine, if it
  finds the problem.
- **When unsure, ask a person.** Sending a claim to Finance is always better than guessing.

## What you have to work with

- The claims in the inbox, each with the employee's note and the receipt as OCR text.
- Our employee directory (who reports to whom).
- Each employee's travel calendar.
- Each employee's past paid claims.
- The policy, as numbered rules.
- A payment tool that sends money. It is not undoable, and calling it twice pays twice.

All of it is in `server/src/tools`. See [tools.md](tools.md).

## The manager approval step

Today a manager approves big claims by replying "yes" to an email, and we lose those emails. We want
a review queue: a manager sees every claim waiting for them, with the AI's summary, and presses
Approve or Reject. Approve pays the claim, once, even if they click twice. This screen does not exist
yet; it is part of your work.
