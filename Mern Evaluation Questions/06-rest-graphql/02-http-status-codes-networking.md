# HTTP Status Codes & Networking

### 1. Difference between http and https?

HTTPS is HTTP over TLS. It encrypts traffic in transit, authenticates the server through certificates, and protects integrity against tampering; HTTP sends data in plaintext and should not be used for authenticated or sensitive applications. HTTPS uses port 443 by default, HTTP uses port 80.

### 2. Explain status code in different ranges and give some examples

1xx are informational, 2xx mean success, 3xx mean redirection, 4xx mean the client sent something wrong, and 5xx mean the server or an upstream failed.

- **2xx and these: 200, 201, 204**  
  200 OK: success, usually with a response body. 201 Created: resource created; the response includes a Location header (and often the new resource). 204 No Content: success with no body (common for deletes and updates).
- **3xx**  
  They indicate redirection or additional client action. Examples include 301 or 308 permanent redirects, 302 or 307 temporary redirects, and 304 Not Modified for conditional caching; clients should follow them according to method-preservation rules.
- **4xx and these: 400, 401 vs 403 difference, 404, 409**  
  400 Bad Request means the request is malformed or fails validation. 401 Unauthorized means authentication is missing or invalid (the client must log in or refresh credentials); 403 Forbidden means the identity is known but lacks permission for that resource or action. 404 Not Found means no matching resource. 409 Conflict means the request conflicts with current state, such as a duplicate email or a version conflict. Others: 422 for semantic validation errors and 429 Too Many Requests for rate limiting.
- **5xx**  
  They indicate server-side or upstream failures rather than a request the client can correct directly. 500 is an unhandled server error, 502 an invalid gateway response, 503 temporary unavailability, and 504 a gateway timeout; errors should be logged with safe correlation IDs.

### 3. What is http cache control? Give examples

Cache-Control is an HTTP header that controls how and for how long browsers and shared caches (CDNs, proxies) store a response. Directives: max-age (seconds a response stays fresh), s-maxage (for shared caches), no-cache (store but revalidate before use), no-store (never cache), public/private, immutable. Examples: hashed assets such as app.3f9a.js get Cache-Control: public, max-age=31536000, immutable; index.html gets no-cache so new deployments are picked up; a user's account page gets private, no-store. Revalidation uses ETag or Last-Modified: the browser sends If-None-Match, and the server replies 304 Not Modified if nothing changed.
