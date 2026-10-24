# Performance & Optimization

### 1. What is indexing, and What's the tradeoff of adding an index?

An index is an auxiliary structure, usually a B-tree, that speeds lookups, joins, ordering, or filtering, like a book's index instead of reading every page. The tradeoff: indexes speed matching reads but consume storage, slow down INSERT/UPDATE/DELETE because each index must be updated, add maintenance work, and can be ignored by the planner if not selective. I add them for measured query patterns, use composite-index column order deliberately, and remove redundant indexes.

### 2. How do you identify slow queries and optimize them?

I use monitoring and slow-query logs (pg_stat_statements in Postgres), inspect EXPLAIN or EXPLAIN ANALYZE, verify row estimates and indexes, reduce scanned rows and selected columns (no SELECT *), avoid N+1 calls, improve schema or queries, then measure the change under realistic load.

### 3. In an EXPLAIN plan, what's the difference between a Seq Scan and an Index Scan?

A sequential scan reads a table's pages in order and is efficient when many rows are needed or the table is small. An index scan traverses an index then fetches matching rows, which is efficient for selective lookups; the planner chooses based on estimated cost. An unexpected Seq Scan on a large table often signals a missing index.

### 4. What is the N + 1 query problem? And how do you identify and solve it?

It occurs when code runs one query for a parent list and then another query per parent for related data, such as 1 query for 100 posts plus 100 queries for their authors, so query count grows linearly. Identify it by enabling ORM query logging and seeing many near-identical queries per request, by APM traces showing dozens of DB spans for one endpoint, or with pg_stat_statements call counts. Solve it with joins, eager loading (Prisma include, Sequelize include), batching with WHERE id IN (...) or DataLoader, and query-level aggregation.
