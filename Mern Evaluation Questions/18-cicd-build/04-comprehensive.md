# Comprehensive

### 1. Give a detailed explanation on how your code is shipped to production

1) Branch from the team's integration branch, implement the Jira ticket, run tests/lint locally, push, and open a PR. 2) CI builds, tests, lints, runs static/security analysis, and produces artifacts or container images. 3) After review and approval, the pipeline deploys to dev, QA, and staging for automated/manual validation. 4) Production deploy uses the team's strategy (rolling, blue/green, or canary). 5) Health checks, smoke tests, logs, metrics, traces, and alerts confirm the release; if problems appear, roll back or disable the feature flag.

### 2. If there's a bug in production, how would you know? And what are the steps you take to fix it?

I'd learn about it from alerts, error tracking, logs, support tickets, or abnormal business metrics. Then: (1) assess severity and impact; (2) contain it (rollback, disable a feature flag, or scale resources); (3) find the root cause using logs, traces, metrics, and recent deployments; (4) reproduce, fix, test, review, and deploy through the normal pipeline (or a hotfix branch), then monitor; (5) document the incident and, for significant ones, run a blameless postmortem and add tests or monitoring.
