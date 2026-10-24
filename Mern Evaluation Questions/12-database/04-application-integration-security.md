# Application Integration & Security

### 1. What is an ORM (Object-Relational Mapping)? Give some examples.

An ORM maps application objects and relationships to relational tables and generates or executes SQL. Examples include Prisma, TypeORM, Sequelize, Drizzle, Hibernate, and Entity Framework; it improves productivity but does not remove the need to understand SQL, indexes, and query performance.

### 2. What is an ODM (Object-Document Mapping)? Give an example.

An ODM maps application objects to document-database documents rather than relational tables. Mongoose is a common MongoDB ODM; it provides schemas, validation, middleware, and query helpers while underlying document modeling still matters.

### 3. What is database migration, and how do we perform them?

A migration is version-controlled, ordered schema change code, such as creating a table or index, with an up (apply) and often a down (revert). I generate them with the ORM's tool (prisma migrate, knex, EF Core), apply them through CI/CD, make changes backward-compatible when deploying gradually, back up high-risk data, and provide tested rollback or forward-fix plans.

### 4. How do you handle data validation?

I validate at multiple layers: client-side for usability, API schemas (Zod, Joi, class-validator) for untrusted input, database constraints (NOT NULL, UNIQUE, CHECK, foreign keys) for final integrity, and domain rules in services. Validation errors are explicit and safe, while database constraints protect against races and bypasses.

### 5. What is SQL injection and how do you prevent it?

SQL injection occurs when untrusted input changes query syntax or intent, for example ' OR '1'='1 bypassing a login. I prevent it with parameterized queries or ORM binding, allowlist validation for dynamic identifiers, least-privilege database accounts, and never concatenate user input into SQL.

### 6. What is a database connection pool?

A connection pool keeps a bounded reusable set of database connections instead of opening one per request. It reduces setup cost and protects the database; pool size must match database capacity and application concurrency to avoid exhaustion.
