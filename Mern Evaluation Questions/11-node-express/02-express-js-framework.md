# Express.js Framework

### 1. Explain the layered architecture in Express.js.

A typical Express application separates routes and controllers for HTTP concerns, services for business rules, repositories for persistence, and models or DTOs for data contracts. A controller should not talk to the database directly, because that mixes transport, business rules, and persistence, making code hard to test, reuse, and change. Keeping dependencies one-directional (route → controller → service → repository) makes logic easier to test and change.

### 2. What is the purpose of the Controller, Service, and Repository layers?

Controllers validate and translate HTTP requests and responses; services implement business use cases and transactions; repositories encapsulate data queries and persistence. A repository is still useful with an ORM, because it centralizes query choices, maps persistence models to domain contracts, provides a test seam, and limits the impact of changing the ORM or database. Each layer has a focused responsibility and can be tested independently.

### 3. What is an Express middleware? Give examples of use cases.

Middleware is a function receiving req, res, and next that runs in the request pipeline and either ends the response or calls next(). Common uses include logging (morgan), body parsing (express.json(), express.urlencoded()), authentication, authorization, validation, rate limiting, CORS, security headers (helmet), error handling, and request correlation IDs.

### 4. How do you handle errors in Express?

I centralize errors in a final error-handling middleware with four arguments (err, req, res, next), translate known errors to safe status codes, log structured diagnostic details with correlation IDs, and avoid leaking stack traces or internals to clients. In Express 4, async route errors must be forwarded with next(err) or a wrapper; Express 5 forwards rejected promises automatically.

### 5. What are CORS issues and how do you handle them?

CORS is the browser's cross-origin permission model, not a server-to-server restriction; a CORS error means the browser blocked the response because the API didn't allow the page's origin. I configure the backend (for example the cors middleware) with an allowlist of trusted origins, methods, headers, and credentials, handle preflight OPTIONS correctly, and do not attempt to solve it with unsafe client-side workarounds.

### 6. What's the difference between req.params, req.query, and req.body?

req.params contains route path variables such as id in /users/:id. req.query contains URL query parameters for filters or pagination (?page=2). req.body contains submitted payload data and needs body-parsing middleware and validation before use.

### 7. How do you implement authentication and authorization middlewares?

Authentication middleware verifies the session or JWT, and on success attaches the identity to req.user (returning 401 if it fails). Authorization middleware then checks that req.user has the required role, scope, or ownership for the route (returning 403 if not). Chain them before the handler, e.g. router.get('/admin', authenticate, authorize('admin'), handler).

### 8. How do you handle returning massive amounts of data in an API?

I filter at the server, paginate using cursors or limits, select only needed fields, compress responses, set response-size limits, stream when appropriate, cache common queries, and use async exports (generate a file and email a download link) for truly large reports rather than returning an unbounded JSON array.

### 9. What is Swagger?

Swagger commonly refers to the OpenAPI ecosystem for describing HTTP APIs. An OpenAPI document defines paths, schemas, authentication, and responses, enabling interactive documentation (Swagger UI), client generation, validation, and contract testing. In Express, swagger-ui-express or swagger-jsdoc can serve it.

### 10. What tools do you use to test your APIs and express apps? (not just Postman)

I use unit tests with Jest or Vitest, HTTP integration tests with Supertest against the Express app, Testcontainers or a test database for persistence, MSW or nock to mock outgoing calls, contract or schema checks with OpenAPI tools, load tests with k6 or Artillery, and manual exploration with Postman, Insomnia, Thunder Client, or REST Client .http files. End-to-end tests exercise critical flows against realistic dependencies.
