# Backend Performance

### 1. How do you identify backend performance issues (e.g., long response times, slow query logs, identifying slow functions)?

I use metrics to find latency percentiles (p95/p99), throughput, saturation, and error rates; distributed traces to see which span in a request is slow; slow query logs and EXPLAIN for the database; and CPU flame graphs or profilers (clinic.js, --inspect) for slow functions. I correlate requests with structured logs and traces, reproduce under realistic load with k6 or Artillery, and isolate whether time is CPU, I/O, database, dependency, or lock contention.

### 2. How do you solve performance bottlenecks or a slow api? (e.g., caching, Redis, query optimization)

I define the slow endpoint's p95 or p99 target, trace its critical path, and fix the largest measured contributor first: add indexes and optimize queries (fix N+1, select fewer columns), cache safe reads in Redis, batch requests, paginate and reduce payloads, run independent I/O in parallel, offload slow work to a background queue, add connection pooling, scale horizontally, or refactor hot code. I load test and monitor after each change to confirm the improvement.

### 3. What are the core pillars of performance monitoring tools (Telemetry, Trace, Log, Metrics)?

Telemetry is the umbrella term for all the data a system emits about itself, collected and exported by instrumentation such as OpenTelemetry. Traces follow one request across services as a tree of timed spans, showing where time is spent. Logs are timestamped records of discrete events with detail for debugging. Metrics are aggregated numeric time series such as request rate, error rate, latency, CPU, and memory, used for dashboards and alerts. Together they enable detection (metrics), localization (traces), and root-cause detail (logs).

- **How dest Otel-LGTM stack map to these?**  
  OpenTelemetry is the telemetry layer: SDKs and the Collector gather and export all signals in a vendor-neutral format. Loki stores and queries logs. Tempo stores traces. Mimir stores metrics (Prometheus-compatible). Grafana is the UI that visualizes and correlates all three and handles alerting. The grafana/otel-lgtm Docker image bundles the whole stack for local development.
