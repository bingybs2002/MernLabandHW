# Core Concepts

### 1. Difference between unit testing, integration testing, E2E testing?

Unit tests verify a small isolated unit such as a function, hook, reducer, or component with its dependencies mocked; they are fast and pinpoint failures. Integration tests verify that several units work together, such as an API route with its service and a real test database, or a component with real providers and mocked network. E2E tests exercise a full user workflow through a real browser against a running app; they give the most confidence but are slowest and most brittle. The testing pyramid recommends many unit tests, fewer integration tests, and a small number of E2E tests for critical paths.

- **Talk about tools you use for each?**  
  Unit: Vitest or Jest, with React Testing Library for components. Integration: Supertest for Express endpoints, React Testing Library with MSW for network mocking, and Testcontainers or a test database. E2E: Playwright or Cypress. Plus coverage reporting (Istanbul/v8) and CI integration.

### 2. What is Test Driven Development (TDD)?

Test-Driven Development is a cycle of writing a failing test first (red), implementing the smallest change to pass it (green), then refactoring while keeping tests green. It can improve design and confidence when used thoughtfully, but it is not a substitute for integration testing or product validation.

### 3. What is BDD (Behavior-Driven Development)? And name one tool for it.

Behavior-Driven Development expresses expected behavior in shared business language, often using Given-When-Then scenarios, aligning developers, QA, and stakeholders around examples. Cucumber is the classic tool: it executes scenarios written in Gherkin and maps each step to automation code. Jest and Mocha's describe/it style is BDD-flavored too.

### 4. What is test coverage?

Coverage measures how much code is exercised by tests, reported as lines, branches, functions, and statements. High coverage is not proof of quality, since tests can run code without asserting meaningful behavior.

- **How much is good coverage?**  
  Many teams set a threshold around 70-80% for lines and branches, with higher coverage for critical business logic such as payments or auth; 100% is rarely worth the cost. Meaningful coverage of business rules, risks, and edge cases matters more than the number.
- **How to increase coverage?**  
  Read the coverage report to find uncovered branches and error paths, add tests for edge cases and failure states, write a regression test with every bug fix, refactor hard-to-test logic into pure functions, delete dead code, and enforce thresholds (especially on new code in each PR) in CI.
