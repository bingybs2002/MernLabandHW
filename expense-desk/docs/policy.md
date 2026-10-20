# Brightline expense policy

The same rules your AI gets from `tools.getPolicy()`. Source: `server/data/policy.json`.

| Rule    | Topic            | The rule                                                                                                                                                                                                                                                                         |
| ------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1**  | Receipts         | Any expense over $25 needs a receipt; without one, reject the claim. We pay what the receipt shows: if the claimed amount is higher than the receipt total, pay the receipt total (partial).                                                                                     |
| **R2**  | Meals            | Meals are covered only while traveling for work (a trip in the employee's travel calendar on that date) or when hosting a client named in the note. Pay up to $75 per person per day; the part above the cap is not paid (partial).                                              |
| **R3**  | Alcohol          | Alcohol is never reimbursed. Remove it from the amount and pay the rest (partial).                                                                                                                                                                                               |
| **R4**  | Hotels           | Hotels are covered up to $250 per night including tax, and the stay must match a trip in the employee's travel calendar. If no trip matches, escalate to Finance; do not reject, because calendars can be out of date. If a night is above the cap, pay up to the cap (partial). |
| **R5**  | Deadline         | Claims must be submitted within 60 days of the expense date. Later claims are rejected.                                                                                                                                                                                          |
| **R6**  | Manager approval | If the amount to pay is over $500, the employee's manager must approve the claim before it is paid (needs_approval).                                                                                                                                                             |
| **R7**  | Gifts            | Gifts, gift cards and cash equivalents are never paid through expenses, even for clients. Escalate to Finance.                                                                                                                                                                   |
| **R8**  | Duplicates       | A receipt can be claimed only once. If the same receipt (same receipt or confirmation number, or the same merchant, date and amount) was already claimed, reject the claim.                                                                                                      |
| **R9**  | Splitting        | Splitting one expense into several smaller claims (for example to stay under the $25 receipt limit) is not allowed. Escalate to Finance.                                                                                                                                         |
| **R10** | What is covered  | Work transport (taxi, ride share, train, flights, parking), conference tickets, and work equipment and supplies are covered in full with a receipt, subject to the rules above.                                                                                                  |

## Decisions

| Decision         | When                                                                                                      | `approvedAmount`                 | Paid by `processClaim`?                 |
| ---------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------- |
| `approve`        | Everything checks out                                                                                     | the full claimed amount          | yes, once                               |
| `partial`        | Allowed, but for less (R1 receipt total, R2 meal cap, R3 alcohol, R4 hotel cap)                           | the lower amount                 | yes, once                               |
| `reject`         | A rule says reject (R1 no receipt, R5 too late, R8 duplicate)                                             | 0                                | no                                      |
| `escalate`       | A rule says send it to Finance (R4 no matching trip, R7 gifts, R9 splitting), or you cannot decide safely | 0                                | no                                      |
| `needs_approval` | The amount to pay is over $500 (R6)                                                                       | the amount to pay after approval | **no**: only after the manager approves |

If more than one rule applies: escalate and reject come before partial and approve, and R6 applies to the amount left to pay.
