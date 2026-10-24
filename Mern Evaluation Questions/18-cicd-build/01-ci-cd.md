# CI/CD

### 1. What does CI/CD stand for, and what is its purpose?

CI is Continuous Integration: developers merge code frequently and every change is automatically built and tested to catch problems early. CD can mean Continuous Delivery or Continuous Deployment. Delivery keeps code continuously ready for release with a manual approval to production; Deployment automatically releases every passing change to production. The goal is faster, safer, repeatable software delivery. Common tools are GitHub Actions, GitLab CI, Jenkins, and Azure DevOps.

### 2. Explain the different environments:

Code moves through a series of environments, each closer to production, so problems are caught before real users see them.

- **local, dev, QA, staging, production**  
  Local: the developer's machine. Dev: shared environment for active development and integration of merged work. QA/Test: environment where testers validate functionality and regressions. Staging: production-like environment (same config, infrastructure, and often anonymized data) used for final validation and UAT. Production: live environment serving real users. Exact names and purposes vary by organization.

### 3. What happens in the CI/CD pipeline after you open an PR?

Opening a PR triggers the CI pipeline: it checks out the code, installs dependencies, then runs linting and formatting checks, type checking, unit and integration tests, a build, and often static analysis (SonarQube), security/dependency scans, and coverage. Results appear as status checks on the PR, and branch protection blocks merging until required checks pass and reviewers approve. Some teams also deploy a preview environment for the PR. After merge, the CD pipeline builds the artifact or Docker image and deploys it to dev/QA/staging, and on to production through approvals or automatically.

### 4. How do you ensure the code quality during the CI/CD pipeline process?

I automate quality gates: build validation, unit/integration tests, linting, type checks, static analysis such as SonarQube quality gates, dependency/security scanning, formatting checks, and code coverage thresholds. Required PR reviews and branch protection add human review. The pipeline should fail when critical quality or security requirements are violated.

### 5. What is SonarQube and Lint? What are their differences?

Lint (such as ESLint) checks source code in the editor and CI for style issues, common bugs, and language-specific patterns, configured by rules per project. SonarQube is a server-based static analysis platform providing broader analysis across the codebase, including bugs, code smells, security vulnerabilities and hotspots, duplication, coverage, and maintainability metrics, with dashboards, history, and quality gates. They overlap, but lint is fast developer feedback on individual files, while SonarQube gives broader quality/security reporting and enforcement.

### 6. What are feature flags? How is cherry-pick different?

Feature flags are runtime configuration switches that control whether a feature is enabled without a new deployment. They allow shipping unfinished code dark, gradual rollouts to a percentage of users, A/B testing, and instant kill switches; tools include LaunchDarkly, Unleash, or a simple config table. Old flags must be cleaned up to avoid technical debt. git cherry-pick is a source-control operation that copies specific commits from one branch onto another, for example applying a hotfix commit from main onto a release branch. The difference: cherry-pick decides which code is included in a build before deployment, while feature flags decide who sees code that is already deployed, at runtime.

### 7. Explain the below deployment strategies, what they are and their benefits:

Both strategies reduce release risk by exposing a new version gradually or in a way that is easy to undo, instead of replacing everything at once.

- **Blue/Green deployment**  
  Blue/Green deployment maintains two identical production environments. Blue serves users while the new version is deployed and validated on Green; then the load balancer switches all traffic to Green. Benefits: near-zero downtime and instant rollback by switching back, at the cost of running duplicate infrastructure and handling database migrations carefully.
- **Canary release**  
  A Canary release sends the new version to a small percentage of users or traffic first (for example 5%). The team monitors metrics and errors, then gradually increases traffic if the release is healthy, or rolls back. Benefits: small blast radius and real production feedback before a full rollout.

### 8. What happens immediately after the deployment? How does the engineering team ensure the deployment is successful?

I verify health checks and deployment status, run smoke tests against critical paths, then monitor dashboards, logs, traces, error rates (Sentry), latency, throughput, and key business metrics such as signups or orders, compared with the previous version. Alerts watch for regressions, and the team stays available for a period after release. If the deployment causes problems, I follow the rollback or mitigation procedure, such as rolling back or disabling a feature flag.

### 9. What is a YAML/.yml file? What do we write in it?

YAML is a human-readable data-serialization/configuration format that uses indentation and key: value pairs. CI/CD systems commonly use YAML to define pipelines, such as .github/workflows/ci.yml for GitHub Actions: triggers (on: push, pull_request), jobs, runners, steps, commands, environment variables and secrets references, caching, artifacts, and deployment stages. It is also used for docker-compose.yml, Kubernetes manifests, and app configuration.
