# NestJS & Java

### 1. What is NestJS briefly? Explain how it's different from Express?

NestJS is a TypeScript-first Node.js framework with Angular-inspired architecture: modules group features, controllers handle routes, and providers (services) are injected through a built-in DI container, all declared with decorators. It runs on top of Express (or Fastify). Express is a minimal, unopinionated HTTP library: you wire routing, middleware, validation, and structure yourself. NestJS adds that structure out of the box, with pipes for validation, guards for auth, interceptors, exception filters, and testing utilities, which suits large teams; Express is lighter and more flexible for small services.

### 2. What are common Java versions in enterprise projects?

Java 8 remains in legacy systems, while Java 11, 17, 21, and 25 are the common long-term-support releases. I use the version mandated by the runtime and framework (Spring Boot 3 requires Java 17+), favoring current LTS versions for new services when compatibility permits.

### 3. Talk about three primary ways of doing dependency injection?

Constructor injection supplies dependencies when an object is created and is generally preferred for required dependencies because they can be final/readonly and are easy to test. Setter injection supports optional or configurable dependencies; field injection (@Autowired on a field) is concise but hides dependencies, is harder to test, and is generally discouraged.

### 4. What is IoC (inversion of control)?

Inversion of Control means your code no longer controls creating and wiring its dependencies or the program flow; a framework or container does, and calls your code when needed ("don't call us, we'll call you"). Dependency injection is the most common way to implement IoC: the Spring IoC container, NestJS, and Angular create objects and inject their dependencies. Event handlers and framework lifecycle hooks are other examples. It leads to loose coupling and easier testing.

### 5. Talk about the 4 principles of OOP

Encapsulation hides internal state behind an interface; abstraction exposes essential behavior and hides details; inheritance reuses or specializes behavior from a parent class; polymorphism lets different implementations satisfy one contract, so the same call behaves differently by type. Composition is often preferred over deep inheritance.

### 6. What are decorators?

Decorators are functions applied with @ syntax to classes, methods, properties, or parameters to attach metadata or wrap behavior without changing the code inside. In TypeScript frameworks: NestJS uses @Controller, @Get, @Injectable, @Body; Angular uses @Component, @Input. TypeScript 5 supports standard ECMAScript decorators, while frameworks often still use the older experimentalDecorators. Java's equivalent is annotations (@Service, @Autowired), which are metadata read by frameworks like Spring rather than functions that run.
