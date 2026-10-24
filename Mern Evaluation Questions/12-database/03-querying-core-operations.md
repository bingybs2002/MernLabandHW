# Querying & Core Operations

### 1. What's the difference between INSERT, UPDATE, and DELETE, and when would you use each?

INSERT creates rows, UPDATE changes existing rows matching a condition, and DELETE removes matching rows. I use precise WHERE clauses (an UPDATE or DELETE without WHERE affects every row), transactions for multi-step changes, and soft deletion or audit records when business recovery requirements apply.

### 2. How do you perform JOINs in SQL?

JOIN combines rows from tables according to a related key condition: SELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id. It lets normalized data be queried as one result while indexes on join keys and join order affect performance.

### 3. Difference between Left Join, Right Join, Inner Join, and Outer Join.

INNER JOIN returns only matching rows. LEFT JOIN returns all left rows plus matching right data or nulls; RIGHT JOIN is the symmetric form. FULL OUTER JOIN returns all rows from both sides with nulls where no match exists.

### 4. What are ACID principles in a database?

Atomicity means a transaction fully succeeds or rolls back; Consistency preserves constraints; Isolation limits interference between concurrent transactions; Durability keeps committed data after failures. The exact isolation level tradeoff affects concurrency and anomalies.

### 5. What is a database transaction?

A transaction groups operations into one atomic unit with BEGIN, then COMMIT or ROLLBACK, such as debiting one account and crediting another. I use it when related updates must remain consistent, choose an appropriate isolation level, keep it short, and handle retries for transient conflicts or deadlocks.

### 6. What is a stored procedure, and what's one real reason to use one?

A stored procedure is executable database-side logic invoked by name with parameters. A real reason: a multi-step data operation such as month-end billing that touches many rows can run inside the database in one call, avoiding many network round trips. Downsides are harder versioning, testing, and portability.

### 7. What is JSONB in PostgreSQL? When would we need it?

JSONB stores parsed binary JSON with indexing (GIN) and query operators, unlike plain JSON text storage. I use it for flexible or semi-structured attributes such as product specs, settings, or third-party payloads, while retaining relational structure for core relationships and carefully indexing common JSON paths.
