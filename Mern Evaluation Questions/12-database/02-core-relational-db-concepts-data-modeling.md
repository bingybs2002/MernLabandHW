# Core Relational DB Concepts (Data Modeling)

### 1. What is database normalization and denormalization? How do we do them?

Normalization organizes data into related tables to reduce duplication and update anomalies, using normal forms and foreign keys. Denormalization intentionally duplicates or precomputes data to accelerate read patterns, trading added storage and consistency-maintenance complexity.

1. 1NF: Every column holds one atomic value, no repeating groups in a single cell. Example: When a table has columns that holds lists, we give it "product_Id" in another table instead. Remember it like this: Each cell holds exactly one value.
2. 2NF: Split the table by their attributes. So, products and order_items needs 2 tables.
3. 3NF: Move the store's own attribute to their own table. So now, every column now depends on the key, the whole key, and nothing but the key.
4. De-normalization: deliberately adding redundant data to a database, so reads are faster. De-normalization means storing data you would otherwise derive at read time. This could be two things: A calculation, or a JOIN.

### 2. What is a Primary key? What is a foreign key?

A primary key uniquely identifies a row and cannot be null. A foreign key references a key in another table, enforcing referential integrity and representing relationships such as an order belonging to a customer (orders.customer_id references customers.id).

### 3. What's the difference between a PRIMARY KEY and a UNIQUE constraint?

A table has one primary key, which is unique and non-null and commonly acts as its identity. A table may have multiple UNIQUE constraints (such as email); null behavior varies by database, and a unique column need not be the table's primary identity.

### 4. Explain the following relations in relational databases and give an example of each:

Relations describe how many rows in one table can link to rows in another, and they are implemented with foreign keys (and a join table for many-to-many).

- **one-to-one**  
  One record links to exactly one related record. Example: a user and their profile row, with profiles.user_id as a unique foreign key.
- **one-to-many**  
  One record links to many related records. Example: one customer has many orders; the foreign key lives on the "many" side (orders.customer_id).
- **many-to-one**  
  Many records link to one record (the inverse of one-to-many, viewed from the other side). Example: many orders belong to one customer.
- **many-to-many**  
  Records on both sides relate to many on the other, implemented with a join table holding foreign keys to both. Example: students and courses via an enrollments table.

### 5. How do you implement a many-to-many relationship in a relational database?

I create a join table containing foreign keys to both related tables, often with a composite primary key or a surrogate ID plus a uniqueness constraint. The join table can also store relationship-specific attributes such as enrolled_at or role.

### 6. What is a View?

A view is a named, saved SELECT query that behaves like a virtual table: CREATE VIEW active_customers AS SELECT ... . It stores no data itself; each query against it runs the underlying query. Views simplify complex joins into a reusable interface, hide columns or rows for security, and keep a stable contract while base tables change. A materialized view stores the query result physically for fast reads and must be refreshed, trading freshness for speed.
