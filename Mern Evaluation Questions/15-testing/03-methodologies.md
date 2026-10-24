# Methodologies

### 1. How do you deal with API calls and mocks during testing?

I mock at the network boundary with MSW or a controlled test server so UI code follows its real request path. I test loading, success, error, retry, and cancellation states, and use contract or integration tests to ensure mocks do not drift from real APIs.

- **When to mock and when to actually call API?**  
  Mock in unit and component tests for speed and determinism, to simulate hard-to-reproduce states (500 errors, timeouts, empty data), and for third-party or paid services (payments, email, SMS). Call the real API in integration tests against my own backend and a test database, and in E2E and post-deploy smoke tests against staging. Never hit production third-party services with side effects; use their sandbox or test mode instead.

### 2. How do you integrate automated tests into a CI/CD pipeline?

I run linting, type checks, unit and integration tests on every pull request (for example in GitHub Actions), then run selected end-to-end and deployment smoke tests in appropriate environments. Results gate merges or releases through required status checks, publish diagnostics and coverage, and keep flaky tests visible rather than silently retrying them away.
