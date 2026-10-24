# Authentication & Authorization

### 1. What is the difference between authentication and authorization?

Authentication verifies who a caller is, for example through password, MFA, or token verification (failure returns 401). Authorization decides what that authenticated identity may do, using roles, permissions, ownership, policy, or attribute-based rules (failure returns 403).

### 2. What is RBAC and how do you handle very granular user permissions?

RBAC (Role-Based Access Control) assigns permissions to roles and roles to users, such as admin, editor, and viewer, making common authorization manageable. For very granular permissions, I check permissions rather than role names in code (can('invoice:approve') instead of role === 'admin'), store role-to-permission mappings in the database so they can change without deploys, and add ABAC (attribute-based) or policy rules for conditions roles can't express, such as "users can edit only their own posts" or "managers can approve invoices under $10,000 in their department." Libraries and engines such as CASL, Casbin, or OPA help. Enforcement always happens server-side in middleware and domain logic; the frontend only hides UI. I cache permissions per session, follow least privilege, and audit sensitive decisions.

### 3. Difference between JWT and Session-based authentication?

Session authentication stores session state on the server (or in Redis) and sends the browser an opaque session ID cookie; the server looks it up on each request, so revocation and logout are straightforward. JWT authentication carries signed claims in a self-contained token that any server can verify without a lookup, which is stateless and works well across services, but makes revocation and token lifecycle design more important.

- **If millions of users are signed in, which strategy should you use?**  
  Both can scale: sessions need a shared, horizontally scalable session store such as Redis Cluster, while JWTs avoid a per-request lookup and suit microservices, but need short expiry, refresh tokens, and a revocation strategy. A common answer is short-lived JWT access tokens plus server-tracked refresh tokens, choosing based on security, logout requirements, and infrastructure rather than user count alone.

### 4. Walk through a full JWT auth flow, from login to an authenticated request.

1) The user submits credentials to POST /login. 2) The server verifies the password hash, then signs a short-lived access token (for example 15 minutes) with claims such as sub, role, and exp, and usually issues a longer-lived refresh token. 3) The client stores the tokens (refresh token in an HttpOnly cookie). 4) The client sends the access token on each request in the Authorization: Bearer header. 5) Middleware verifies the signature, expiry, issuer, and audience, attaches the user to the request, and authorization checks permissions before serving the resource. 6) When the access token expires (401), the client calls /refresh with the refresh token to get a new access token; on logout the refresh token is revoked.

### 5. What is a JWT, what are the three parts of it?

A JWT (JSON Web Token) is a compact, URL-safe token carrying signed claims. It has three base64url-encoded parts separated by dots: the header (algorithm and token type), the payload (claims such as sub, exp, iat, role), and the signature, which lets receivers verify integrity and the issuer. The payload is encoded, not encrypted, so anyone can read it; never put secrets or sensitive personal data in it.

- **How do you sign and verify a JWT token?**  
  The issuer signs base64url(header) + "." + base64url(payload) with a symmetric secret (HS256) or an asymmetric private key (RS256/ES256), for example jwt.sign(payload, secret, { expiresIn: '15m' }). The verifier recomputes the signature with the same secret or the public key (jwt.verify) and validates the algorithm, expiration, issuer, and audience rather than trusting decoded content alone.

### 6. Token Security

Token security means protecting the signing key, limiting how long a stolen token is useful, and having a way to cut off access.

- **Where to store the JWT Secret?**  
  Never in source code, the repository, or the frontend. Locally it lives in an environment variable from a .env file excluded from Git; in production it is injected from a secrets manager such as AWS Secrets Manager or HashiCorp Vault, or kept in a KMS. Prefer asymmetric keys (RS256/ES256) so only the auth service holds the private key and other services verify with the public key, use a strong random value, and rotate keys using a kid (key ID) header.
- **What if token is stolen? Could you invalidate it? What would you do?**  
  A plain JWT can't be invalidated by itself: it is verified without contacting the issuer, so a stolen token works until it expires. To cut off access: revoke the user's refresh tokens, denylist the token's jti in Redis until its expiry, and force logout everywhere by incrementing a per-user tokenVersion that the server checks on each request. If the signing key leaked, rotate it, which invalidates all tokens. Going forward: keep access tokens short-lived, rotate refresh tokens with reuse detection, and store them in HttpOnly cookies.

### 7. What is the difference between an access token and a refresh token?

An access token is short-lived (minutes) and presented to APIs on every request for authorization. A refresh token is longer-lived (days or weeks), sent only to the auth server to obtain new access tokens, and needs stronger protection, rotation, reuse detection, and a revocation mechanism.

- **How they work together?**  
  The client uses the access token until it expires and the API returns 401. It then sends the refresh token (usually automatically, as an HttpOnly cookie) to /refresh, and the server validates it, issues a new access token, and with rotation also a new refresh token, invalidating the old one. This keeps the frequently sent token short-lived while users stay logged in; logout revokes the refresh token.

### 8. Where could you store authentication tokens (Local storage vs. Http-only cookies)?

The common options are localStorage/sessionStorage, in-memory JavaScript variables, and HttpOnly cookies. The safest common choice is an HttpOnly, Secure, SameSite cookie, often combined with keeping a short-lived access token in memory.

- **And explain their own vulnerabilities**  
  localStorage is easy to use with an Authorization header and is not sent automatically (so less CSRF risk), but any script on the page can read it, so a single XSS bug steals the token. HttpOnly cookies can't be read by JavaScript, so XSS cannot steal the token, but because the browser sends them automatically they are vulnerable to CSRF, which I mitigate with SameSite plus a CSRF token or origin checks. If tokens must live in JavaScript, I keep access tokens short-lived and in memory and put the refresh token in an HttpOnly cookie.

### 9. What are OAuth 2.0, OIDC, and SSO, and how do they relate?

OAuth 2.0 is a protocol for delegated authorization: it lets an application access a user's resources on another service with an access token, without seeing the user's password; the recommended flow is authorization code with PKCE. OIDC (OpenID Connect) is an identity layer on top of OAuth 2.0 that adds authentication: it returns a signed ID token (a JWT) saying who the user is, plus a userinfo endpoint. SSO (Single Sign-On) is the user-facing outcome of logging in once and accessing many applications, commonly implemented with OIDC or SAML through an identity provider. Relation: OAuth grants access, OIDC proves identity using OAuth, and SSO is built on OIDC/SAML.

- **Give one example for each**  
  OAuth 2.0: a scheduling app asks permission to read your Google Calendar and receives an access token scoped to calendar data. OIDC: a "Sign in with Google" button on a third-party site, which receives an ID token identifying you. SSO: logging in once with your company Okta or Microsoft Entra account and opening Slack, Jira, and Workday without logging in again (or one Google account across Gmail, YouTube, and Drive).
