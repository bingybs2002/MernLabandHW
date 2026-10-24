# Storage, Databases & Caching

### 1. What is S3, and what is it used for? How is it different from a database or a file system?

S3 (Simple Storage Service) is AWS's object storage: you store objects (files plus metadata) under keys in buckets, with virtually unlimited capacity and very high durability (11 nines), accessed over an HTTP API. It is used for user uploads, images and static assets (often behind CloudFront), static website hosting, backups, logs, and data lakes. Unlike a database, it has no query language, indexes, joins, or transactions over content; you fetch by key and list by prefix. Unlike a file system, it has a flat namespace (folders are just key prefixes), you replace whole objects rather than edit in place, there is no file locking, and it is not mounted as a disk (EBS and EFS cover that). Clients can upload or download directly with presigned URLs instead of proxying bytes through the server.

### 2. What are S3 storage classes and lifecycle rules, and why use them?

Storage classes trade storage price against access cost and speed: S3 Standard for frequently accessed data, Intelligent-Tiering for unknown or changing patterns, Standard-IA and One Zone-IA for infrequent access, and Glacier Instant Retrieval, Glacier Flexible Retrieval, and Glacier Deep Archive for archives (cheapest storage, slower and paid retrieval). Lifecycle rules automate moving objects between classes and deleting them after a set time, for example move logs to Standard-IA after 30 days, to Glacier after 90, and delete after a year, also cleaning up old versions and incomplete multipart uploads. They cut storage costs without manual work and enforce retention policies.

### 3. What are the AWS equivalents of Postgres/MySQL, MongoDB, Redis, and Kafka?

Postgres/MySQL: Amazon RDS, or Amazon Aurora (AWS's high-performance, compatible engine). MongoDB: Amazon DocumentDB (MongoDB-compatible); DynamoDB is AWS's native NoSQL alternative, and MongoDB Atlas also runs on AWS. Redis: Amazon ElastiCache (Redis OSS/Valkey) for caching, or MemoryDB for a durable primary database. Kafka: Amazon MSK (Managed Streaming for Apache Kafka), with Kinesis Data Streams as AWS's native streaming alternative.
