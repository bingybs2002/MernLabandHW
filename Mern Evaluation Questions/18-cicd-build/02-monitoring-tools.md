# Monitoring Tools

### 1. How do you monitor your app in production?

I use logs, metrics, traces, health checks, alerts, and dashboards, with structured logging and correlation/request IDs so a request can be traced across services.

- **tools used**  
  Sentry for error tracking, an APM such as New Relic or Datadog, CloudWatch for AWS infrastructure, Grafana with Prometheus/Mimir, Loki, and Tempo (often fed by OpenTelemetry), Splunk or ELK for log search, uptime checks, and PagerDuty or Slack for alert routing.
- **things you look for**  
  Error rate and new exceptions, latency percentiles (p95/p99), throughput, availability, CPU, memory, and disk saturation, database performance and slow queries, queue depth, Core Web Vitals on the frontend, and key business metrics such as signups, orders, and payments. Alerts are tied to SLOs so they are actionable.

### 2. List out some common monitoring tools and their uniqueness

Each tool has a focus: APM (New Relic), log search and analytics (Splunk), and error tracking (Sentry).

- **New Relic?**  
  An all-in-one observability platform: application performance monitoring, infrastructure monitoring, logs, distributed tracing, browser and mobile monitoring, dashboards, and alerting. Its uniqueness is deep APM with code-level transaction traces in one SaaS product.
- **Splunk?**  
  A platform to collect, index, search, and visualize huge volumes of logs and machine data with its SPL query language. Its uniqueness is powerful log search and analytics, widely used for troubleshooting, compliance, and security (SIEM) in enterprises.
- **Sentry.io?**  
  Developer-focused error and performance monitoring. It captures exceptions with stack traces (with source maps), request context, breadcrumbs, release tracking, and session replay, and groups errors into issues assigned to developers. Its uniqueness is fast, code-level debugging of frontend and backend errors.

### 3. What is Otel-LGTM stack and what does each one do?

Otel-LGTM is an open-source observability stack: OpenTelemetry collects telemetry, and the Grafana LGTM stack (Loki, Grafana, Tempo, Mimir) stores and visualizes it. It is vendor-neutral and covers logs, metrics, and traces in one place.

- **explain all five**  
  OpenTelemetry (OTel): the CNCF standard SDKs, APIs, and Collector that instrument apps and export logs, metrics, and traces in a vendor-neutral format (OTLP). Loki: log aggregation that indexes only labels, making log storage cheap, queried with LogQL. Grafana: the dashboard and visualization UI that queries all the data sources, correlates logs, metrics, and traces, and handles alerting. Tempo: distributed tracing backend that stores traces cheaply and lets you jump from a trace to related logs. Mimir: horizontally scalable, long-term storage for Prometheus-compatible metrics, queried with PromQL.
