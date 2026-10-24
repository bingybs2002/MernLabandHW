# Redis

### 1. What is Redis and its primary use cases?

Redis is an in-memory data store supporting strings, hashes, lists, sets, sorted sets, streams, and more, with optional persistence to disk (RDB snapshots or AOF logs). Common uses are caching, sessions, rate limiting, leaderboards (sorted sets), queues, distributed locks used carefully, pub/sub, and fast ephemeral state.

### 2. Explain caching with Redis.

The application keeps frequently read, expensive-to-compute data in Redis with a TTL, so most reads are served from memory in sub-millisecond time instead of hitting the database.

- **Cache hit vs. cache miss**  
  A cache hit finds a valid requested value in cache and avoids the slower origin. A cache miss finds no usable value and must load from the source, usually then populating cache. A high hit ratio is the goal, but it must be checked together with correctness (stale data) and latency.
- **The cache-aside pattern**  
  In cache-aside (lazy loading), the application reads cache first, loads the database on a miss, and writes the result into cache with a TTL. On writes it updates the database then invalidates (deletes) or updates the cache key. It is simple and common but needs TTLs and race-aware invalidation.
- **Cache eviction policies (e.g., LRU)**  
  An eviction policy decides what Redis removes when memory reaches maxmemory: allkeys-lru removes the least recently used keys, allkeys-lfu the least frequently used, volatile-* variants only consider keys with a TTL, and noeviction rejects writes. I choose based on access pattern and monitor memory, evictions, and hit rate.

### 3. How do you scale the read and write operations of Redis?

For reads, add replicas and route reads to them when slightly stale reads are acceptable. For writes and memory capacity, shard keys across multiple primaries with Redis Cluster, avoid hot keys, and design key distribution to prevent uneven load. Vertical scaling (more memory) is the first step but limited.

- **What is Replication**  
  Replication copies a primary's data to one or more replicas asynchronously. Replicas serve reads and can be promoted for failover (Sentinel or Cluster handles this automatically), but replication can lag and does not distribute writes.
- **What is Sharding**  
  Sharding divides the keyspace across multiple primary nodes so each holds and writes only part of the data, increasing total memory and write throughput.
- **What is Redis Cluster?**  
  Redis Cluster is Redis's built-in sharding: it splits keys into 16,384 hash slots spread across several primaries, each with replicas for automatic failover. Clients are routed to the node that owns a key's slot; multi-key operations must use keys in the same slot (hash tags like {user:1}).
