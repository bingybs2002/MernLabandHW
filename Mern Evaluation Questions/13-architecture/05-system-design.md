# System Design

### 1. State the CAP theorem. What does it mean for a design?

CAP says that a distributed system can guarantee at most two of Consistency (every read sees the latest write), Availability (every request gets a non-error response), and Partition tolerance. Because network partitions are unavoidable in real distributed systems, the practical meaning is: when a partition happens, you must choose between staying consistent or staying available. It guides explicit tradeoffs per feature rather than a one-time label for a whole system.

- **Explain the tradeoffs between consistency and availability?**  
  Choosing consistency (CP) means the system rejects or delays requests it cannot serve with up-to-date data, returning errors or timeouts during a partition; this suits bank balances, inventory reservations, and payments. Choosing availability (AP) means every node keeps answering, possibly with stale data, and reconciles later (eventual consistency); this suits social feeds, product catalogs, likes, and shopping carts. Many databases let you tune it per operation, for example quorum reads/writes, and even without partitions stronger consistency usually costs latency.

### 2. How do you make a system fault tolerant?

Assume every component will fail and remove single points of failure: run multiple instances across availability zones behind a load balancer, replicate data with automatic failover, use health checks to route around bad instances, make operations idempotent so retries are safe, buffer work in durable queues, isolate resources with bulkheads, degrade gracefully, back up data and test restores, and monitor and alert so failures are detected quickly.

- **What are the four fault-tolerance patterns (timeout, retry, circuit breaker, fallback), and what does each solve?**  
  Timeout bounds how long a caller waits so slow dependencies don't tie up threads. Retry handles transient failures, using exponential backoff with jitter and only for idempotent operations. Circuit breaker stops calling an unhealthy dependency so it can recover and callers fail fast. Fallback provides degraded but useful behavior, such as cached data or a default response. Together they prevent one slow dependency from causing cascading failure.

### 3. What is a CDN, and how does it improve the performance of a system?

A CDN (Content Delivery Network) is a globally distributed network of edge servers that cache content close to users. It improves performance by cutting network latency (shorter distance), offloading traffic and load from the origin server, absorbing traffic spikes and DDoS attacks, and often terminating TLS and compressing or optimizing assets at the edge. It is ideal for static assets, images, videos, versioned JavaScript and CSS, and cacheable public responses; personalized content needs careful cache controls.

### 4. What is a load balancer, and how does it choose an instance?

A load balancer distributes incoming requests across multiple healthy instances so no single server is overwhelmed. It chooses using algorithms such as round robin, weighted round robin, least connections, least response time, IP hash or consistent hashing (for sticky routing), and it removes unhealthy targets. Layer 4 balancers route by IP/port; Layer 7 balancers (like AWS ALB) route by HTTP path, host, or headers.

- **What is a health check?**  
  A health check is an endpoint or probe (such as GET /health) that the load balancer or orchestrator calls periodically to decide whether an instance should receive traffic. Liveness detects a stuck process that should be restarted, readiness confirms it can serve requests, and dependency checks should avoid making every transient downstream issue remove all capacity.
- **What is the difference between an API Gateway and a load balancer?**  
  A load balancer primarily distributes traffic among equivalent instances of the same service. An API Gateway is an application-aware edge layer that routes to different services by path and applies authentication, rate limits, request transformation, aggregation, and API policy. They are often used together: gateway in front, load balancers behind it.
