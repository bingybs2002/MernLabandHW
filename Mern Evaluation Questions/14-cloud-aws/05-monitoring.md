# Monitoring

### 1. What is CloudWatch? How is it different from other APM like Otel-LGTM?

CloudWatch is AWS's built-in monitoring service: it collects metrics from AWS services automatically, stores logs (CloudWatch Logs), and provides alarms, dashboards, and traces through X-Ray and Application Signals. Its strengths are zero setup for AWS resources and tight integration with auto scaling and alarms; its downsides are AWS lock-in, per-metric and per-GB pricing that grows quickly, and weaker cross-signal correlation for application debugging. Otel-LGTM (OpenTelemetry + Loki, Grafana, Tempo, Mimir) is an open-source, vendor-neutral stack: OpenTelemetry instrumentation works across any cloud or backend, Grafana correlates logs, metrics, and traces in one UI, and you can self-host or use Grafana Cloud, at the cost of more operational work. Many teams use CloudWatch for AWS infrastructure and OpenTelemetry for application telemetry.
