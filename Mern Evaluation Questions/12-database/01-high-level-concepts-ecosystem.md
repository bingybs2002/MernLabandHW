# High-Level Concepts & Ecosystem

### 1. What is the difference between SQL (relational) and NoSQL databases (non-relational) on a high level? How to choose?

SQL databases organize structured data in related tables with a fixed schema, use a declarative query language with joins, and provide strong ACID transactions; they traditionally scale vertically or with read replicas. NoSQL covers models such as documents, key-value, wide-column, and graph stores, often favoring flexible schemas and horizontal distribution for specific access patterns. How to choose: start from the data and queries. Choose SQL when data is relational, you need joins, ad-hoc queries, and transactional integrity (orders, payments, users); it is the safe default. Choose NoSQL when the schema is genuinely flexible or nested, access patterns are known and simple (lookups by key), you need very high write throughput or horizontal scale, or the shape fits a specific model such as cache (Redis), documents (MongoDB), or graphs (Neo4j).

### 2. Give some examples of SQL and NoSQL databases? (3 of each)

Common SQL databases include PostgreSQL, MySQL, and Microsoft SQL Server. Common NoSQL databases include MongoDB (document), Redis (key-value), and Cassandra (wide-column), plus DynamoDB and Neo4j; choosing one depends on data relationships, consistency, queries, and operational requirements.
