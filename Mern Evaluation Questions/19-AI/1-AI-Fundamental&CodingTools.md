# AI Fundamentals & Coding Tools

### 1. What are prompts, tokens, and the context window?

A prompt is the input text (instructions, context, examples, and the question) sent to a large language model to get a response. Tokens are the units a model reads and writes: chunks of text, roughly 3-4 characters or about three-quarters of an English word on average; models are billed and limited by tokens. The context window is the maximum number of tokens the model can consider at once, including the system prompt, conversation history, tool results, documents, and its own output. Anything outside the window is invisible to the model, so I manage it by keeping prompts focused, summarizing or trimming old history, retrieving only relevant documents (RAG), and starting fresh sessions for new tasks.

### 2. What are the differences between skills and hooks?

In AI coding tools such as Claude Code, a skill is a packaged set of instructions (a SKILL.md file plus optional scripts and resources) that the model loads on demand when a task matches its description, such as "how we write migrations" or "how to build a PDF." Skills add knowledge and procedures, and the model decides when to use them. A hook is a user-defined shell command that the tool runs automatically at a lifecycle event, such as before or after a tool call, when a session starts, or when a response finishes, for example running Prettier after every file edit or blocking edits to .env files. In short: skills guide what the model does and are optional for it to use; hooks are deterministic automation that always runs, regardless of what the model decides.

### 3. How do you use AI in your day-to-day work and to help with your code?

I use AI coding assistants such as Claude Code, Cursor, or GitHub Copilot to explore and explain unfamiliar codebases, scaffold components and boilerplate, write and refactor code, generate unit tests and edge cases, debug errors from stack traces and logs, write documentation, commit messages, and PR descriptions, and review my own diffs before opening a PR. I give it clear context (relevant files, conventions, and acceptance criteria), work in small steps, and keep project rules in a CLAUDE.md or similar file so suggestions match our standards. I treat it as a fast pair programmer: I stay responsible for design decisions and for every line that gets merged.

### 4. How do you verify the AI's output and keep the code secure?

Verify: I read and understand every change before accepting it, run the code, tests, linter, and type checker, ask the AI to explain its reasoning, check that suggested APIs and packages actually exist and are current (models hallucinate), and still send AI-written code through normal PR review and CI. Keep it secure: never paste secrets, credentials, or sensitive customer data into prompts; use company-approved tools with data-retention and training opt-out settings; review AI code for common vulnerabilities such as injection, missing auth checks, and unsafe input handling; run security scanners (Dependabot, Snyk, SonarQube); vet new dependencies; and restrict an agent's permissions so it cannot run destructive commands or access production without approval.
