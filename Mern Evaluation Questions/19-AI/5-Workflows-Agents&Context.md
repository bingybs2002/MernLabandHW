# Workflows, Agents & Context

### 1. What is a workflow, what is an agent, and what is the difference?

A workflow is a system where LLM calls and tools are orchestrated through predefined code paths: the developer decides the steps and their order, such as extract, then classify, then summarize. An agent is a system where the LLM dynamically decides its own steps and tool usage in a loop until the goal is met. The difference is who controls the flow: workflows are predictable, cheaper, easier to test, and best for well-defined tasks; agents are flexible and handle open-ended problems where steps can't be known in advance, but they are less predictable, slower, and costlier. Start with the simplest option and add agency only when needed.

### 2. What are some common workflow patterns?

Common patterns include prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer (one LLM generates and another critiques in a loop).

- **prompt chaining**  
  Splits a task into a fixed sequence of LLM calls where each step's output feeds the next, often with checks (gates) in between, for example generate an outline, verify it meets criteria, then write the document. It trades latency for higher accuracy on each simpler step.
- **router**  
  Classifies the input first, then sends it to a specialized prompt, tool, or model, for example routing customer queries to refund, technical-support, or general handlers, or sending easy questions to a small cheap model and hard ones to a larger model.
- **parallelization**  
  Runs multiple LLM calls at the same time and combines the results. Sectioning splits a task into independent parts handled in parallel (such as one call answering and another screening for policy violations); voting runs the same task several times and aggregates for more reliable answers (such as several reviewers checking code for vulnerabilities).

### 3. What is context engineering, and how could you do it?

Context engineering is designing and managing everything that goes into the model's context window, not just the prompt wording: system instructions, conversation history, retrieved documents, tool definitions and results, memory, and examples, so the model has exactly the information it needs at each step. Because context is limited and too much irrelevant context degrades quality and raises cost, you curate it. How: write clear, well-structured system prompts; retrieve only relevant chunks (RAG); keep tool descriptions concise and the tool set small; summarize or compact long histories; store notes and state outside the context (memory files, a scratchpad, a database) and load them only when needed; trim large tool outputs; and use sub-agents with their own clean context for focused subtasks.

### 4. What is agent orchestration (orchestrator-workers)?

In the orchestrator-workers pattern, a central orchestrator LLM breaks a complex task into subtasks at runtime, delegates each to worker LLMs or sub-agents (often in parallel, each with its own focused context and tools), then collects and synthesizes their results into a final answer. Unlike fixed parallelization, the subtasks aren't predefined; the orchestrator decides them based on the input. Examples: a coding agent that changes several files, or a research system where workers each investigate one aspect. Tradeoffs are more tokens, higher cost, and harder debugging.

### 5. What is a checkpoint, and why does a long-running agent need one?

A checkpoint is a saved snapshot of an agent's state at a point in its execution: messages, intermediate results, which step it's on, and any variables, persisted to a database or storage. Long-running agents need checkpoints so they can resume after a crash, timeout, or deploy without starting over and repeating expensive or side-effecting steps; pause for human input and continue hours later; support "time travel" debugging by replaying or rewinding from an earlier state; and keep memory across multiple user turns.

### 6. How do you add human approval to an agent?

Add a human-in-the-loop checkpoint before risky or irreversible actions such as sending email, spending money, deleting data, or deploying. The agent proposes the action and pauses; its state is saved (checkpointed); the app shows the pending action to a person, who can approve, edit, or reject; then the agent resumes with that decision. In LangGraph this is done with interrupt() plus a checkpointer, and Command(resume=...) continues the run. Classify tools by risk so only dangerous ones need approval, show enough detail for an informed decision, and log every decision for auditing.
