# Microservices

### 1. What is microservice architecture? Why do we need it? Advantages of it.

Microservice architecture splits a system into small, independently deployable services aligned to business capabilities, each owning its logic and data and communicating over the network. Advantages: independent deployment and release cycles, team autonomy, independent scaling of hot services, fault isolation, and freedom to choose technology per service. It only pays off when organizational and operational maturity justify distributed-system complexity.

### 2. What do you give up with microservices, and when should you stay a monolith?

A monolith deploys one application unit with in-process calls and usually one database; microservices deploy separately and talk over the network. You give up simple local calls, easy ACID transactions and joins, straightforward debugging, and low operational overhead in exchange for network latency, partial failures, distributed tracing, more deployment pipelines, and data-consistency complexity. I stay monolithic (ideally a modular monolith) for early products, small teams, and domains without clear independent boundaries.

### 3. Why does each service own its own database, and what replaces JOINs and transactions?

Database ownership prevents hidden coupling and lets services evolve schemas, scale, and deploy independently; if two services share tables, a schema change in one breaks the other. Cross-service joins are replaced by API composition, replicated read models fed by events, or a BFF that aggregates data. ACID transactions across services are replaced by sagas with compensating actions, idempotent handlers, and the outbox pattern, accepting eventual consistency.

### 4. What is the difference between horizontal and vertical scaling?

Vertical scaling (scale up) adds CPU, memory, or capacity to one machine and is simple but bounded and a single point of failure. Horizontal scaling (scale out) adds more instances behind a load balancer, increasing throughput and availability but requiring stateless application design, load balancing, and coordination.

### 5. How do microservices communicate between each other using sync vs async? What are the tradeoffs?

Synchronous: REST over HTTP, gRPC, or GraphQL, where the caller waits for the response. Asynchronous: a message queue (RabbitMQ, AWS SQS), pub/sub (SNS, RabbitMQ exchanges), or event streaming (Kafka), where the producer sends and moves on. Tradeoffs: sync is simple and gives an immediate result, but it couples availability and latency, so a slow or failing dependency cascades. Async decouples services, absorbs traffic bursts, and is more resilient, but adds eventual consistency, ordering concerns, duplicate handling, and harder debugging/observability.

### 6. When should you use 'REST Api requests' or 'message queue' between services?

Use REST (or gRPC) when the caller needs an immediate answer to continue, such as checking inventory before showing a price or validating a user; apply timeouts, safe retries, and circuit breakers. Use a message queue for background work, notifications, fan-out events (OrderPlaced consumed by email, analytics, and shipping), absorbing bursts, and workflows that tolerate eventual completion; consumers must be idempotent and retry-aware.

### 7. What is modular monolith?

A modular monolith is a single deployable application internally divided into well-bounded modules (such as orders, billing, users) with explicit public interfaces and owned data, where modules cannot reach into each other's internals or tables. It gets much of the boundary and team-ownership benefit of microservices without network calls, distributed transactions, or extra infrastructure, and modules can later be extracted into services when there is a real need.

### 8. How to migrate a monolithic application to a microservice app?

I first stabilize boundaries within the monolith (often making it modular), identify a low-risk bounded context, and extract it behind an API or event boundary using the strangler fig pattern: route traffic for that capability to the new service while the rest stays in the monolith. I migrate data incrementally, add observability and contract tests, and avoid a big-bang rewrite.

### 9. What is an API Gateway? How does it work in a microservice architecture?

An API gateway is a single entry point between clients (web apps, mobile apps, third parties) and backend services. Instead of the frontend calling ten services directly, it calls the gateway, which routes each request to the right service and handles cross-cutting concerns such as authentication, rate limiting, TLS termination, request aggregation, logging, and caching. Examples include Kong, AWS API Gateway, and NGINX.

### 10. What is service discovery?

Service discovery is how services find the current network locations of other services when instances scale up, down, or move. Instances register with a service registry (Consul, Eureka, etcd) and health checks remove unhealthy ones. With client-side discovery the caller queries the registry and picks an instance; with server-side discovery a load balancer does it. In Kubernetes, Services and built-in DNS (orders-service.default.svc) provide discovery automatically.

### 11. What is a Circuit Breaker? What is Opossum?

A circuit breaker stops calls to a failing dependency after a failure threshold (open state), returns a fast fallback, and periodically lets a test request through (half-open) to detect recovery before closing again. It prevents cascading failures and resource exhaustion; Opossum is a Node.js library implementing this pattern.
