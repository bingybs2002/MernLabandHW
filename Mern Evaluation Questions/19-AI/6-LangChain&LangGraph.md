# LangChain & LangGraph

### 1. What are LangChain, LangGraph and LangSmith, and how do they fit together?

LangChain is a framework with building blocks for LLM apps: a common interface to many model providers, prompt templates, tools, document loaders, text splitters, retrievers, and integrations, plus high-level agent helpers. LangGraph is a lower-level orchestration framework for building stateful, controllable agents and workflows as graphs, with persistence, loops, branching, streaming, and human-in-the-loop support. LangSmith is a platform for observability and evaluation: tracing every LLM and tool call, debugging, datasets, evals, prompt management, and monitoring. They fit together as: LangChain components (models, tools, retrievers) used inside LangGraph nodes for orchestration, all traced and evaluated in LangSmith. Each can also be used independently.

### 2. What are the three parts of a LangGraph graph?

State: a shared data structure (a TypedDict, Pydantic model, or Zod schema in JS) that holds everything the graph tracks, such as messages; reducers define how updates merge, for example appending messages. Nodes: functions that receive the current state, do work (call an LLM, run a tool), and return updates to the state. Edges: connections that decide which node runs next, either fixed edges or conditional edges that route based on the state, including loops back and the special START and END.

### 3. What does LangGraph give you that a plain while loop does not?

A plain while loop calling an LLM and tools works for simple agents, but LangGraph adds production features out of the box: persistence with checkpointers, so runs survive crashes and can resume; human-in-the-loop with interrupt to pause, wait for approval, and resume later; time travel to inspect, replay, or fork from earlier states; streaming of tokens, node updates, and events; explicit, inspectable control flow with branching, cycles, parallel nodes, and subgraphs; thread-based short-term memory and a store for long-term memory; error handling and retries per node; and tracing and visualization through LangSmith and LangGraph Studio. Writing all of that by hand around a while loop is a lot of fragile code.

### 4. What is a checkpointer, and what is thread_id for?

A checkpointer is LangGraph's persistence layer: after every step (super-step) it saves a snapshot of the graph's state, using InMemorySaver for development or SqliteSaver or PostgresSaver for production. It enables memory across turns, resuming after failures, human-in-the-loop pauses, and time travel. The thread_id, passed in the config ({"configurable": {"thread_id": "user-123-chat-1"}}), identifies which conversation or run the checkpoints belong to, so each user or conversation has its own separate history. Invoking the graph again with the same thread_id continues from the saved state; a new thread_id starts fresh.

### 5. How does interrupt work, and why must you not charge a card before it?

Calling interrupt(value) inside a node pauses the graph: LangGraph saves the state with the checkpointer and returns the value (such as "Approve $50 charge?") to the caller, then waits indefinitely. To continue, you invoke the graph again with the same thread_id and Command(resume=answer); interrupt then returns that answer. The key detail is that on resume LangGraph re-runs the interrupted node from its beginning, not from the line where it paused. So any side effect placed before interrupt() in the same node, such as charging a card, runs again on resume and the customer gets charged twice. Put side effects after the interrupt, in a separate node after approval, or make them idempotent (for example with an idempotency key).
