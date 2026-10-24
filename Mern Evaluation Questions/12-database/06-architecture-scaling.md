# Architecture & Scaling

### 1. How do you do vertical scaling and horizontal scaling for relational databases?

Vertical scaling increases a single server's CPU, RAM, storage, or I/O capacity and is simple but limited and often requires downtime. Horizontal scaling adds nodes: read replicas for read traffic, partitioning large tables, and sharding rows across nodes by a shard key, increasing complexity around consistency and routing. Caching and connection pooling also reduce load.

### 2. What is a primary node and a replica node?

A primary node accepts authoritative writes and replicates changes to replicas. Replicas serve read traffic or failover, improving availability and read scale, but replication lag means read-after-write consistency needs deliberate handling.

### 3. What problem does sharding and replication each solve?

Sharding partitions data across nodes to distribute write volume and storage capacity when one machine can no longer hold or write all the data; a well-chosen shard key avoids hot shards. Replication copies the same data to multiple nodes for availability, fault tolerance, and read scaling; it does not by itself divide a primary's write workload.

### 4. How do you do scaling for Document-based NoSQL databases?

Horizontal scaling through sharding: data is partitioned across nodes by a shard key, and choosing a key with good distribution avoids hot shards. Replica sets (a primary plus secondaries) give failover and read scaling. I also add proper indexes, model data with embedding so reads need one document, add a cache such as Redis in front, and sometimes use managed services (like MongoDB Atlas) that automate sharding and replication. Vertical scaling (bigger machines) helps first but has limits.
