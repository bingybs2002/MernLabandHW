# Code Review / Patterns

### 1. What do you look for during code reviews?

I check correctness, requirements, edge cases, readability, maintainability, security, error handling, performance, tests, API contracts, database/query behavior, and consistency with project conventions. I focus first on issues that could cause bugs or operational problems, keep feedback specific and kind, and leave style issues to automated tooling where possible.

- **What is SOLID principle?**  
  SOLID is a set of object-oriented design principles: Single Responsibility (a class or module has one reason to change); Open/Closed (open for extension, closed for modification); Liskov Substitution (subtypes should be substitutable for their base types); Interface Segregation (prefer focused interfaces over large ones); Dependency Inversion (depend on abstractions rather than concrete implementations).
- **What is DRY principle**  
  DRY means Don't Repeat Yourself: avoid duplicated knowledge or business logic so that a rule has a single authoritative representation. However, I avoid over-abstraction: two pieces of code that only look similar but represent different concepts do not necessarily need to share an abstraction (sometimes duplication is cheaper than the wrong abstraction).
- **What are good naming conventions**  
  Names should be descriptive and reveal intent (getActiveUsers, not getData), avoid unclear abbreviations, and follow the codebase's conventions consistently. In JavaScript/TypeScript: camelCase for variables and functions, PascalCase for classes, React components, types, and interfaces, UPPER_SNAKE_CASE for constants, booleans prefixed with is/has/should (isLoading), functions named with verbs, event handlers as handleX/onX, and kebab-case for URLs and often for file names. Linters help enforce them.

### 2. How do you organize the folder structure of your project?

I organize it around clear responsibilities and domain boundaries. For a typical frontend, that could be feature folders plus shared components, pages/routes, hooks, services/API clients, state, utilities, and tests. For a backend, I might separate routes/controllers, services/business logic, repositories/data access, models/DTOs, middleware, configuration, and tests. The goal is high cohesion, low coupling, and easy navigation rather than following one universal structure.

### 3. What is Singleton? Why need it? Give examples.

Singleton ensures a class has one shared instance within a given application scope and provides a global access point. It is useful for resources that should be shared rather than recreated, such as a database connection pool, a configuration object, a logger, a Redis client, or an in-memory cache. In Node.js, a module that exports an instance is effectively a singleton because modules are cached. In dependency-injection frameworks (NestJS, Spring), I configure a service with singleton scope rather than hand-writing the pattern, because hand-rolled singletons act as hidden global state and make testing harder.

### 4. Explain functional programming vs imperative programming

Imperative programming describes how to perform a task through statements that change state, such as loops and assignments. Functional programming emphasizes what to compute by composing pure functions, using immutable data, and minimizing side effects. JavaScript supports both styles. For example, items.filter(i =&gt; i.active).map(i =&gt; i.price) is functional, while a for loop that pushes into a mutated array is imperative.
