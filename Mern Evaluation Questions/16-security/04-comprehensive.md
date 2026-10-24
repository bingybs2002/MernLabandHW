# Comprehensive

### 1. How do you ensure a secure web application?

Defense in depth: HTTPS everywhere, strong authentication and authorization enforced server-side, hashed/salted passwords, input validation and output escaping, protection against XSS/CSRF/SQL injection, CSP and security headers (helmet), secure token storage, secrets management, rate limiting, dependency and vulnerability scanning (npm audit, Dependabot, Snyk), least privilege, logging/monitoring, and keeping software patched. I use the OWASP Top 10 as a checklist.

- **How do you protect user data?**  
  Encrypt data in transit (TLS) and at rest, minimize collected data, apply least-privilege access and strong authentication, hash passwords, store secrets securely, validate and sanitize input, mask sensitive data in logs, audit and monitor access, follow relevant privacy regulations (GDPR, CCPA), and have incident-response and backup procedures.
