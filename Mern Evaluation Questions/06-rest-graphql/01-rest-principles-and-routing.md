# REST Principles and Routing

### 1. What are some RESTful URL design principles?

REST URLs name resources with plural nouns (/users, /users/42); the HTTP method is the action, so no verbs in the path (POST /orders, not /createOrder). Use path parameters for identity and hierarchy (/users/42/orders); query parameters for filtering, sorting, and pagination (?status=paid&page=2); request body for payloads. Version the API (/api/v1), return meaningful status codes (201, 204, 400, 401, 403, 404, 409, 500), and keep naming consistent (lowercase kebab-case).

### 2. How can you define the versions of an API (e.g., v1, v2)?

Common approaches are a path version such as /api/v1/users, a custom or Accept header media version (Accept: application/vnd.myapp.v2+json), or a query parameter (?version=2). I prefer explicit path versions for public APIs because they are visible and easy to route and cache, preserve old versions during migration, document deprecation, and make breaking changes deliberate.

### 3. What is the difference between a Path parameter (e.g., /:variable) and a Query parameter?

A path parameter identifies a resource or required route segment, as in /users/42. A query parameter modifies a request or supplies optional criteria, as in /users?role=admin&page=2.

### 4. What is a request body and a Data Transfer Object (DTO)?

The request body carries submitted data, commonly JSON, for methods such as POST, PUT, and PATCH. A DTO is the explicit data contract accepted or returned by an API; it validates and decouples public transport shape from internal database models (for example, never returning a password hash).

### 5. When do we use GET, POST, PUT, PATCH, and DELETE? Explain each method.

GET reads without changing state; POST creates or triggers non-idempotent processing; PUT replaces a resource representation; PATCH applies a partial update; DELETE removes a resource. Correct method semantics support caching, retries, and clear client expectations.

### 6. Difference between PUT and PATCH?

PUT replaces the full representation at a known URI and is normally idempotent; omitted fields are reset or removed. PATCH sends only intended changes and may or may not be idempotent depending on its patch semantics; I document behavior and validate partial updates carefully.

### 7. What is idempotent? Give examples, explain in details

An idempotent operation leaves the server in the same state whether it is performed once or many times; the response may differ, but the effect does not. GET, HEAD, OPTIONS, PUT, and DELETE are idempotent by design: PUT /users/42 with the same body sets the same values every time, and DELETE /users/42 deletes it once (a second call may return 404, but nothing else changes). POST is not idempotent: sending POST /orders twice creates two orders. PATCH depends on its content: { "name": "Ann" } is idempotent, but { "op": "increment", "field": "count" } is not. Idempotency matters because networks fail and clients retry; for non-idempotent operations such as payments, I use an Idempotency-Key header so the server stores the first result and returns it for repeated requests instead of charging twice. Idempotent is different from safe: safe methods (GET, HEAD) do not change state at all.

### 8. What is the difference between client-side pagination and server-side pagination?

Client-side pagination downloads all data then slices it in the UI, which only works for small static datasets. Server-side pagination sends page or cursor parameters and returns a bounded result, reducing bandwidth and database work for large changing data.
