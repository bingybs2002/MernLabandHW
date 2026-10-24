# Compute & Containers

### 1. Why run the app on EC2 and the database on RDS, instead of installing Postgres on the same instance?

RDS provides managed backups, point-in-time recovery, patching, replication, Multi-AZ failover, monitoring, and encryption. Separating compute and data also lets each scale, secure (database in a private subnet), and recover independently, so the app servers can be stateless and replaced freely instead of tying database durability to one application instance.

### 2. What kind of workload is Lambda well-suited for, and what's a bad fit for it?

Lambda fits short-lived, event-driven, spiky or infrequent work: API endpoints with variable traffic, scheduled jobs, S3 upload processing, queue consumers, and webhooks. It is a poor fit for long-running jobs (over the 15-minute limit), persistent connections like WebSockets servers, steady high-volume workloads where always-on compute is cheaper, large local state, or latency-critical paths sensitive to cold starts.

- **Why keep a background job (like generating a shipping label) in a separate Lambda instead of adding an endpoint to the main app?**  
  It decouples slow or failure-prone work from the user request, letting the main app respond quickly and scale independently. A queue or event triggers the worker, enabling retries, monitoring, dead-letter handling, and controlled concurrency, and a failure in label generation doesn't affect the main API.

### 3. What's a "cold start" in Lambda, and how to handle this issue?

A cold start is the extra initialization time when AWS creates a new execution environment: downloading code, starting the runtime, and running initialization code before handling the first event, typically from tens of milliseconds to a few seconds. Handle it with provisioned concurrency for latency-sensitive functions, SnapStart (for Java, Python, .NET), smaller deployment packages and fewer dependencies, initializing SDK clients and connections outside the handler so warm invocations reuse them, choosing lighter runtimes, and keeping latency-critical paths off Lambda when needed.

### 4. What do ECS and Fargate each do, and how do they work together?

ECS (Elastic Container Service) is AWS's container orchestrator: you define task definitions (which image, CPU, memory, env) and services (how many tasks to keep running behind a load balancer). Fargate is a serverless compute engine that runs those tasks without you managing EC2 hosts. Together: ECS decides what to run and keeps it healthy; Fargate provides the compute. ECS can alternatively run tasks on EC2 instances you manage.

### 5. What is EKS? How does it relate to Kubernetes and to ECS?

EKS (Elastic Kubernetes Service) is AWS's managed Kubernetes control plane. It runs standard Kubernetes workloads on EC2 nodes or Fargate and is appropriate when you want Kubernetes portability, its ecosystem (Helm, operators), or multi-cloud consistency. ECS is AWS's own simpler orchestrator, so EKS and ECS are alternatives: ECS is generally easier to operate, EKS more portable and flexible.

### 6. How do EC2, Fargate, and Lambda compare?

EC2 offers full virtual-machine control and suits persistent or specialized workloads, but you manage OS, patching, and scaling. Fargate runs containers without managing servers and suits long-running services and APIs, billing per task CPU/memory. Lambda runs short event-driven functions with automatic scaling to zero and per-request billing, with execution time and cold-start limits. Control and responsibility decrease from EC2 to Lambda, while convenience increases.

### 7. How does auto-scaling work for EC2 and ECS?

Auto scaling adds or removes capacity automatically based on demand, using scaling policies such as target tracking (keep average CPU at 50%), step scaling, scheduled scaling, and predictive scaling. For ECS, Service Auto Scaling adjusts the number of running tasks based on CloudWatch metrics such as CPU, memory, or ALB request count per target; on Fargate that is all you need, while on the EC2 launch type capacity providers also scale the underlying instances.

- **What is an Auto Scaling group on EC2, and what does it scale on (CPU, request count, schedule)?**  
  An Auto Scaling group (ASG) is a set of EC2 instances launched from a launch template with a minimum, desired, and maximum size, usually spread across availability zones and registered with a load balancer. It replaces unhealthy instances automatically and scales on CloudWatch metrics such as average CPU utilization, ALB request count per target, custom metrics like queue depth, or on a schedule for predictable peaks.
