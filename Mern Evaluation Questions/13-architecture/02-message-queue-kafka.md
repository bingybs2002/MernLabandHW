# Message Queue (Kafka)

### 1. What are a message queue and event-driven architecture, and how do they relate?

A message queue buffers messages between producers and consumers so work can be processed asynchronously and at a controlled rate. Event-driven architecture is a design style where services communicate by publishing events, facts about something that already happened (OrderPlaced, PaymentFailed), and other services react without the publisher knowing who is listening. They relate as tool and style: message queues and brokers are the infrastructure most commonly used to implement event-driven architecture.

- **What is the Pub/Sub pattern?**  
  Pub/sub is a messaging pattern: publishers send messages to a topic, and every subscriber to that topic gets its own copy; publishers don't know who the subscribers are. A point-to-point queue, in contrast, delivers each message to one consumer. Pub/sub is the most common way to implement event-driven architecture.

### 2. What is Kafka and why would you use it?

Kafka is a distributed, durable event-streaming platform that stores ordered records in partitioned topics for replayable consumption, with retention measured in days or forever rather than deleting on read. I use it for high-throughput event pipelines, activity tracking, log aggregation, integration events between services, and stream processing, not as a universal replacement for request-response APIs.

### 3. Explain Kafka’s core concepts.

Producers write messages to topics, topics are split into partitions stored on brokers, and consumers in consumer groups read partitions and track their position with offsets.

- **Message**  
  A message (record) is a key, a value (payload), a timestamp, and optional headers. The key decides which partition it goes to; good messages have versioned schemas, an event ID, and enough context for an idempotent consumer to process them safely.
- **Topic and partition**  
  A topic is a named log for one kind of event, such as orders. Kafka divides a topic into partitions, each an ordered append-only log distributed and replicated across brokers; partitions provide parallelism, while ordering is guaranteed only within one partition.
- **Consumer group**  
  A consumer group is a set of consumers sharing work for a topic. Each partition is assigned to at most one consumer in that group, so groups scale processing up to the partition count, while separate groups can independently consume the same event stream.
- **Offset**  
  An offset is a monotonically increasing position of a record within one partition. Consumers commit offsets to record progress, which lets them resume, replay, or recover after failures according to chosen delivery semantics.

### 4. What delivery guarantees does Kafka give?

By default Kafka provides at-least-once delivery: messages are not lost if configured correctly but may be redelivered after failures. At-most-once happens if offsets are committed before processing. Exactly-once is possible within Kafka using idempotent producers and transactions, but side effects in external systems still need idempotent consumers.

- **Message ordering**  
  Kafka guarantees ordering within a partition, not across a topic. Messages with the same key always go to the same partition, each partition is an append-only log read in offset order, and only one consumer in a group reads a given partition at a time. Idempotent producers keep retries from reordering messages, so all events for one key, such as one order, stay in order.
- **Preventing data loss**  
  Replication plus safe producer and consumer settings: replication factor 3; producer acks=all with idempotence; min.insync.replicas=2 (a write needs two copies); unclean leader election disabled; consumers commit offsets only after processing.

### 5. How do you handle duplicate messages?

Duplicates are normal with at-least-once delivery (retries, rebalances, crashes before commit), so consumers must be idempotent. Usual technique: a processed_events table keyed by event ID. Insert first with ON CONFLICT DO NOTHING and skip the message if the row already existed. Do both in one transaction with the business write; otherwise a message can be marked done but never processed. Natural idempotency (upserts, "set status = shipped") also helps.

- **What does it mean for a consumer to be idempotent?**  
  An idempotent consumer can process the same message more than once without producing an incorrect extra effect, such as charging a card twice or sending two emails. Processing it twice leaves the same end state as processing it once.

### 6. How is Kafka different from RabbitMQ?

Kafka is a durable distributed log optimized for high-throughput streams, retention, replay, and partitioned consumption; consumers pull and track their own offsets, and messages stay after being read. RabbitMQ is a traditional broker optimized for flexible routing, per-message acknowledgements, priorities, and work distribution; it pushes messages to consumers and removes them once acknowledged. Neither is universally better: Kafka for event streams and replay, RabbitMQ for task queues and complex routing.

- **What is a RabbitMQ exchange?**  
  Producers in RabbitMQ publish to an exchange, not directly to a queue. The exchange routes messages to one or more queues based on its type and bindings: direct (exact routing key), topic (pattern match like order.*), fanout (every bound queue), and headers. Consumers read and acknowledge from queues.

### 7. What is a dead-letter queue for?

A dead-letter queue stores messages that repeatedly fail, expire, or cannot be routed, keeping the main consumer flow healthy instead of blocking on a "poison" message. Teams inspect, fix, replay, or discard these messages with alerts and retention policies rather than silently losing them.

### 8. What is the saga pattern, and why does event-driven architecture need one?

A saga runs a cross-service business transaction as a sequence of local transactions, each with a compensating action. Event-driven systems need it because each service owns its database, so there is no single ACID transaction across services. If step 4 fails, it compensates 3, 2, 1 in reverse (refund payment, release stock, cancel order). Two styles: choreography (services react to each other's events) and orchestration (a coordinator directs each step). The result is eventual consistency, not ACID.
