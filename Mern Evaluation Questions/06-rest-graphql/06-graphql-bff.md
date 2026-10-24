# GraphQL & BFF

### 1. Why was GraphQL created, and why did many teams later move away from it?

Facebook created it in 2012 to let clients, especially mobile apps on slow networks, efficiently compose data from evolving backend systems in one request. Teams may move away when schema and resolver complexity, authorization per field, N+1 queries, caching, or operational cost outweigh its flexibility.

### 2. What is a GraphQL schema?

A schema is the typed contract defining object types, fields, inputs, queries, mutations, subscriptions, and their relationships. It enables validation, introspection, generated tooling, and a clear client-server agreement.

### 3. What is a resolver?

A resolver is server code that produces the value for a GraphQL field. It receives parent, arguments, context, and selection information; I keep resolvers thin, enforce authorization, and batch data access with DataLoader to avoid N+1 queries.

### 4. What's the difference between a query and a mutation?

A query reads data and should not cause side effects. A mutation changes server state and is executed serially by the GraphQL server; both return typed selection sets so the client can request useful resulting fields.

### 5. What is a BFF (Backend for Frontend), and what problem does it solve?

A Backend for Frontend is a backend layer tailored to one client experience, such as web or mobile. It aggregates services, shapes data, centralizes client-specific orchestration, and prevents UI code from becoming a distributed-systems coordinator.

- **Why is it slow for a browser to call several microservices to build one page?**  
  Each call adds connection, latency, authentication, error handling, and potential waterfall delays; it also exposes internal topology and complicates authorization. An API gateway or BFF can aggregate calls server-side with lower-latency networking and a simpler client contract.
