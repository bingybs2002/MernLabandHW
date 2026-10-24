# Tools & Implementation

### 1. What are the different types of testing, and when do you use each?

Different test types answer different questions about a build, from "does it start?" to "did we break anything?", and they run at different points in the pipeline.

- **Smoke testing**  
  A small, fast set of checks confirming that a build's core functions start and work at a basic level, such as the app loads and login works. I run it right after each deployment to catch obvious release failures before broader testing or user impact.
- **Happy path testing**  
  Verifies the expected successful user flow with valid inputs and available dependencies, such as a user registering and checking out. It is necessary but insufficient; I also test validation, permissions, errors, empty states, boundaries, and recovery behavior.
- **Regression testing**  
  Reruns existing tests after changes to ensure previously working behavior has not broken. Automated unit, integration, E2E, and visual tests run in CI on every PR as the regression safety net, supplemented by targeted manual testing for high-risk changes.
- **Snapshot testing**  
  Records a serialized output, such as a rendered component tree, and fails when it changes. It catches unintended UI output changes, but large snapshots are noisy and get blindly updated; I prefer focused behavioral assertions and keep snapshots small and reviewed.

### 2. How do you write your test cases?

I derive cases from acceptance criteria, user workflows, business rules, known risks, and boundary conditions, covering happy path, edge cases, and error cases. Each test follows Arrange-Act-Assert, has one meaningful behavior, a descriptive name, deterministic dependencies, and asserts observable behavior rather than implementation details.

- **What is a good test coverage?**  
  Typically 70-80% lines and branches as a team threshold, higher for critical logic; the goal is meaningful coverage of important behavior, not a perfect number.
- **How do you generate a coverage report?**  
  vitest run --coverage or jest --coverage generates an HTML report plus lcov.info. CI uploads the lcov file to SonarQube or Codecov to display it and enforce thresholds.

### 3. What tools do you use for frontend and backend testing?

I use the same runner (Vitest or Jest) on both sides, with different helpers for the browser and server.

- **Frontend unit testing (e.g., Jest, Vitest, React Testing Library)**  
  Vitest or Jest as the runner and assertion framework, React Testing Library with user-event for user-focused component tests, and MSW for realistic network mocking. I query by accessible roles and labels (getByRole, getByLabelText) rather than implementation classes.
- **Backend testing (e.g., Jest, supertest)**  
  Jest or Vitest for logic and integration tests, Supertest to call Express HTTP endpoints without starting a real server, and isolated test databases or Testcontainers for persistence. I mock only external boundaries and verify contracts, authentication, validation, and error responses.

### 4. Explain how you use Playwright or Cypress for E2E testing.

I write tests for critical user flows such as login, search, and checkout, locate elements by role, label, or test ID (page.getByRole('button', { name: 'Submit' })), and assert visible outcomes. I rely on auto-waiting for UI or network conditions rather than arbitrary sleeps, isolate test data, mock or stub only third-party services, and collect traces, screenshots, and videos on failure. Playwright runs across Chromium, Firefox, and WebKit in parallel and headless in CI; I run a focused smoke suite on each PR and broader suites against staging.
