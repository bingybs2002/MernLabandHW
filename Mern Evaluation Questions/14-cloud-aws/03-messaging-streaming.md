# Messaging & Streaming

### 1. What is SQS and SNS? How do they work together?

SQS (Simple Queue Service) is a durable managed message queue: producers send messages, and consumers poll, process, and delete them; each message goes to one consumer. It offers standard (at-least-once, best-effort order) and FIFO queues, visibility timeouts, and dead-letter queues. SNS (Simple Notification Service) is managed pub/sub: a message published to a topic is pushed to every subscriber, such as SQS queues, Lambda, HTTP endpoints, email, or SMS. Together they form the fan-out pattern: publish one event to an SNS topic, which delivers a copy to several SQS queues, one per consuming service.

- **Which one do we put in the front, why?**  
  SNS goes in front. The producer publishes once to SNS without knowing who consumes the event, and SNS fans the message out to multiple SQS queues. Each consumer gets its own durable queue with independent retries, dead-letter queue, and pace, so one slow or failing consumer doesn't block or lose messages for the others, and new consumers can subscribe without changing the producer. SNS alone has no buffering for consumers that are down, which is why SQS sits behind it.
