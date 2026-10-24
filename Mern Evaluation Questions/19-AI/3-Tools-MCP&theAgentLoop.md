# Tools, MCP & the Agent Loop

### 1. What is a tool? What makes an AI an agent?

A tool (function calling) is a capability you describe to the model with a name, description, and JSON schema for its inputs, such as get_weather, search_docs, or run_sql. The model does not execute it; it returns a structured request to call the tool, your code runs it, and the result is sent back to the model. An AI becomes an agent when it uses tools in a loop to pursue a goal with some autonomy: it decides which actions to take, observes the results, and keeps going until the task is done, rather than producing a single response or following a fixed, predefined path.

### 2. What is the agentic loop? How does it work?

The agentic loop is the cycle an agent repeats until a task is finished: think, act, observe. 1) The model receives the goal, context, and available tools. 2) It decides on the next step and requests a tool call. 3) The application executes the tool and returns the result to the model. 4) The model reads the result and decides whether to call another tool, retry, or give a final answer. The loop stops when the model returns a final response (no more tool calls) or a guard is hit, such as a maximum number of steps, a token or cost budget, a timeout, or a human approval checkpoint. Good loops also handle tool errors and keep context small.

### 3. What is MCP?

MCP (Model Context Protocol) is an open standard, introduced by Anthropic in 2024 and now widely adopted, for connecting AI applications to external tools and data sources. Instead of writing a custom integration for every app and model combination, a service is exposed once as an MCP server and any MCP-compatible AI app can use it, like "USB-C for AI." It defines how servers expose tools (actions), resources (data), and prompts (templates), using JSON-RPC over stdio for local servers or HTTP for remote ones.

- **also explain MCP server and its purpose**  
  An MCP server is a program that wraps a service, such as GitHub, Slack, a database, or a file system, and exposes its capabilities through the MCP protocol as tools, resources, and prompts. Its purpose is to give AI apps safe, standardized access to that service, handling authentication and permissions, so the integration is built once and reused by many clients.
- **MCP client**  
  An MCP client lives inside the host AI application (such as Claude Desktop, Claude Code, Cursor, or VS Code). It connects to MCP servers (one client connection per server), discovers their tools and resources, passes them to the model, and forwards the model's tool calls to the server and the results back.
