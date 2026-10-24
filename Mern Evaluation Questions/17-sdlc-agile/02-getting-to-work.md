# Getting to Work

### 1. How do you get your work or ticket?

Work comes from the prioritized Product Backlog. During backlog refinement and sprint planning the team discusses, estimates, and commits to tickets; then developers usually pull tickets from the sprint board in Jira, or a lead assigns them based on priority, skills, and workload. I make sure I understand the acceptance criteria before starting.

- **Who manages Product Backlog**  
  The Product Owner is accountable for the Product Backlog: creating and ordering items (features, bugs, improvements, technical work) and maximizing its value, while the whole team contributes to refinement and technical understanding.
- **process of assigning the tickets: when, where, how**  
  When: mainly at sprint planning, and during the sprint when someone finishes their work and pulls the next item. Where: on the Jira (or similar) sprint board. How: in Scrum, developers commonly self-assign by picking the highest-priority ticket they can take; in some teams a tech lead, engineering manager, or Scrum Master assigns work based on skills and capacity. Tickets are estimated (often in story points) before being committed.

### 2. List out some Scrum ceremonies and explain each.

The main Scrum events are Sprint Planning, Daily Scrum, Sprint Review, and Sprint Retrospective, all inside a time-boxed sprint (usually two weeks). Backlog refinement is also commonly performed, although it is not an official Scrum event.

- **Sprint planning**  
  At the start of the sprint, the Scrum Team decides what can be delivered and how. The team discusses the Sprint Goal, reviews prioritized backlog items, checks capacity and dependencies, and selects work that is realistic for the sprint.
- **Daily Standup (DSU): what you discuss**  
  A 15-minute daily meeting to coordinate around the Sprint Goal. A common format is: what I completed yesterday, what I am working on today, and any blockers. Detailed problem-solving happens afterward with the relevant people.
- **Sprint Review/Demo**  
  Held at the end of the sprint to inspect the increment with stakeholders: demo what was delivered, gather feedback, and discuss what should happen next. It is primarily a feedback and product-inspection session, not just a presentation.
- **Sprint retrospective**  
  A team meeting after the review focused on improving the way the team works: what went well, what did not go well, and specific action items to try in the next sprint.
- **Sprint grooming (backlog refinement)**  
  A working session where the team clarifies upcoming stories, identifies dependencies, breaks down large items, adds acceptance criteria, and estimates work, so future backlog items are ready for sprint planning.

### 3. What is the typical whole workflow when working on a Jira ticket?

A ticket moves across the board through To Do, In Progress, Code Review, QA/Testing, and Done. I read the ticket and acceptance criteria and clarify questions with the PO, move it to In Progress, branch and implement with tests, open a PR and move it to Code Review, address feedback and merge, then it deploys to the dev/QA environment for verification, and it moves to Done once it meets the Definition of Done.

- **explain Git workflow**  
  I pull the latest main (or develop), create a feature or bug-fix branch named after the Jira ticket (feature/PROJ-123-add-login), make small commits with clear messages, rebase or merge main to stay current, run tests and lint locally, push the branch, and open a PR linked to the Jira ticket. CI runs automated checks, reviewers approve, and the PR is merged (often squash-merged) according to the team's branching strategy, triggering deployment.
- **explain DoD & acceptance criteria**  
  Acceptance criteria are ticket-specific conditions that define when a particular story is functionally acceptable, often written as Given-When-Then. Definition of Done is the team's shared quality standard that applies to all work, for example code reviewed, tests passing, documentation updated, and deployed to the required environment. Acceptance criteria answer "Did this feature meet its requirements?"; Definition of Done answers "Is this work complete to our team's quality standard?"

### 4. How do you make sure you finish your tasks on time, and what do you do if you fall behind?

I clarify requirements early, break work down, track progress daily, and communicate risks as soon as I see them rather than at the deadline.

- **Planning and prioritizing**  
  I clarify requirements and acceptance criteria before starting, break large work into small tasks, identify dependencies and risks, estimate realistically, work on the highest-priority items first, and avoid unnecessary scope creep.
- **Raising blockers early**  
  If I'm stuck, waiting on a dependency, or see a risk, I raise it immediately in standup or directly with the team or lead rather than waiting until the deadline. I explain the cause, what I've tried, and what help I need.
- **Renegotiating scope or deadline**  
  If the date is at risk, I propose options with the PO or lead: reduce nonessential scope or deliver an MVP first, split the ticket and move part to the next sprint, get help from a teammate, or adjust the deadline. The key is making the tradeoff visible early so the team can decide.
