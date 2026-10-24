# Browser Security

### 1. What is CORS?

CORS (Cross-Origin Resource Sharing) is a browser security mechanism that relaxes the same-origin policy in a controlled way, deciding whether a web page from one origin (scheme + host + port) may read responses from a different origin. The server uses Access-Control-Allow-Origin and related headers to declare which origins, methods, headers, and credentials are allowed; for non-simple requests the browser first sends a preflight OPTIONS request. The browser enforces it; it is not a server-to-server restriction.

- **How do you resolve CORS on the backend versus the client?**  
  CORS is resolved on the backend by configuring the server (for example the Express cors middleware) to send the correct Access-Control-Allow-* headers for an allowlist of trusted origins, methods, and credentials, and by handling preflight OPTIONS requests. The client cannot safely disable CORS; during development a dev-server proxy (Vite server.proxy) can make requests same-origin, and in production a reverse proxy or same domain also avoids it, but the real fix is server configuration.

### 2. What is XSS (Cross-Site Scripting)? How to defend against it?

XSS is a vulnerability where an attacker injects malicious JavaScript into a page that other users visit. The browser runs it under your site's origin, so it can steal data or act as the victim. Types: stored (saved in the database, such as a comment), reflected (from a URL parameter), and DOM-based. Defense: rely on React's default output escaping; avoid innerHTML/dangerouslySetInnerHTML; sanitize with DOMPurify when HTML is required; validate input and block javascript: URLs; set a CSP; keep tokens in HttpOnly cookies, not in JS-readable storage.

- **CSP (Content Security Policy)**  
  CSP is an HTTP response header that tells the browser which sources of scripts, styles, images, and other resources are allowed to load, for example Content-Security-Policy: default-src 'self'; script-src 'self'. By disallowing inline scripts and untrusted origins, it reduces the impact of XSS: even if an attacker injects a script tag, the browser refuses to execute it. It is defense in depth, not a replacement for output escaping and sanitization.
- **How to avoid HTML Injection**  
  HTML injection happens when untrusted input is rendered as markup. Treat input as text: React escapes values interpolated into JSX, and in plain DOM code use textContent instead of innerHTML. If rendering user-provided HTML is required, sanitize it with a strict allowlist such as DOMPurify immediately before rendering, and validate URLs and server output too.

### 3. What is CSRF and how do you defend against it?

CSRF (Cross-Site Request Forgery) tricks a logged-in user's browser into sending an unwanted authenticated request to your site, such as a hidden form on an attacker's page that posts to /transfer, abusing cookies the browser sends automatically. Defenses: SameSite cookies (Lax or Strict), anti-CSRF tokens, verifying Origin/Referer headers, never using GET for state changes, and requiring re-authentication for sensitive actions. APIs using an Authorization header (not cookies) are largely immune.
