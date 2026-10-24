# Security & Configuration

### 1. What is IAM? What are users, roles, and policies?

IAM (Identity and Access Management) controls who can do what in AWS. Users represent long-lived identities for people or applications with permanent credentials (now often replaced by SSO). Roles are identities with temporary credentials that people, EC2 instances, Lambda functions, or other accounts assume, which is the preferred way for workloads to access AWS. Policies are JSON documents that allow or deny actions on resources (for example s3:GetObject on one bucket), attached to users, groups, or roles, following least privilege.

### 2. What is AWS Secrets Manager, and why use it instead of a .env file in production?

Secrets Manager securely stores, encrypts (with KMS), audits, and can automatically rotate secrets such as database credentials and API keys. It is safer than a production .env file because access is controlled and logged through IAM and CloudTrail, secrets can rotate without redeploying, and they are never baked into images, repositories, or deployment artifacts. Apps fetch them at startup or have them injected by ECS/Lambda.
