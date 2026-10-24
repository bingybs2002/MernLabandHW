# REST vs GraphQL

### 1. What is the difference between RESTful APIs and GraphQL?

REST exposes multiple resource-oriented endpoints and uses HTTP semantics directly. GraphQL exposes a typed schema, usually through one endpoint, where clients request an exact data shape; it can reduce round trips but adds server and caching complexity.

### 2. What are "overfetching" and "underfetching," and how does GraphQL solve them?

Overfetching means receiving unused fields; underfetching means needing extra requests to complete one screen. GraphQL lets clients request exactly needed fields and related data in one query, though good REST endpoint design can also address both.

### 3. How do HTTP responses differ between REST (multiple status codes) and GraphQL (always 200)?

REST commonly signals outcome with HTTP status codes per endpoint. GraphQL often returns HTTP 200 for a successfully processed GraphQL request while placing field-level failures in an errors array next to partial data, though transport and authentication failures can still use non-2xx statuses.

### 4. Why is it easier to cache RESTful APIs compared to GraphQL?

REST GET URLs naturally identify cacheable representations and work with HTTP/CDN caches. GraphQL commonly uses one POST endpoint and variable queries, so caching needs query-aware keys, persisted queries, or a normalized client cache such as Apollo's.

### 5. When would you choose RESTful over GraphQL, and vice versa?

I choose REST for straightforward resource APIs, HTTP caching, public integrations, and operational simplicity. I choose GraphQL when multiple clients need different composed data shapes and the team can own schema governance, performance controls, and observability.
