# Server Security

### 1. How do you safely store secrets such as user passwords and API keys?

Passwords are hashed, never stored or encrypted reversibly; API keys and other secrets live in a secrets manager or environment variables, never in code or the client.

- **Why not plain text?**  
  If the database is leaked, stolen through SQL injection, or read by an insider, every account is immediately exposed, and because people reuse passwords, their accounts on other sites too. Passwords should never be logged or reversibly encrypted either.
- **Explain hashing and salt.**  
  Hashing is a one-way function that turns input into a fixed-length digest that cannot be reversed; at login you hash the attempt and compare. A salt is a unique random value added to each password before hashing so identical passwords produce different hashes, defeating precomputed rainbow tables. Password hashes should also be deliberately slow, with bcrypt, scrypt, or Argon2 (which handle salting automatically), to resist brute force; fast hashes like SHA-256 alone are not suitable.
- **Where do you store sensitive API keys?**  
  Not in client-side code or source control (also scan with tools like git-secrets or GitHub secret scanning). Locally, environment variables from a .gitignored .env file; in production, a managed secrets store such as AWS Secrets Manager, HashiCorp Vault, or a cloud parameter store, with access controlled by IAM, audit logging, and rotation enabled. Frontend apps call third-party APIs through the backend so the key never reaches the browser.

### 2. How do you protect a server against DDoS attacks and abuse?

Use layered defenses: a CDN/WAF and DDoS protection service (such as Cloudflare or AWS Shield with AWS WAF) to absorb and filter traffic at the edge; rate limiting and throttling per IP, user, or API key (token bucket or sliding window counters in Redis, express-rate-limit), returning 429; bot filtering, IP reputation, and CAPTCHA for sensitive endpoints like login; request size limits and timeouts; autoscaling and load balancing; caching; and monitoring with alerts for traffic anomalies. Rate limiting also stops abuse such as brute-force logins, scraping, and runaway costs.

### 3. What is SQL Injection? Different ways to prevent it

SQL injection occurs when untrusted input alters a query's syntax, for example ' OR '1'='1 bypassing a login or '; DROP TABLE users;-- destroying data. Prevent it with parameterized/prepared statements (WHERE email = $1), ORM or query-builder methods that bind parameters, input validation with allowlists for dynamic identifiers such as sort columns, least-privilege database accounts, avoiding string concatenation in raw queries, and a WAF as an extra layer.
