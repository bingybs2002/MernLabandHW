# Angular

### 1. What does it mean when we say Angular is a framework, but React is a library?

Angular includes routing, forms, dependency injection, HTTP tooling, templates, testing setup, and a CLI with strong conventions as a complete framework; it calls your code (inversion of control). React focuses mainly on rendering UI, and you call it, leaving routing, state, and data choices to the application ecosystem.

### 2. What is NgRx?

NgRx is an Angular state-management ecosystem inspired by Redux, using actions, reducers, selectors, effects, and a centralized store built on RxJS. It is useful for complex shared state and explicit side-effect workflows; NgRx SignalStore is a lighter signals-based option.

### 3. What is 'signal' briefly and in which version was it released?

A signal is a reactive value wrapper that notifies consumers when it changes: const count = signal(0); count.set(1); with computed() for derived values and effect() for side effects. Signals enable fine-grained change detection without Zone.js-driven checks of the whole tree. They were introduced as a developer preview in Angular 16 (May 2023) and became stable in Angular 17.

### 4. What are RxJs and observables briefly? How are they different from promises?

RxJS is a library for reactive programming with Observables, which Angular uses for HTTP, routing, and forms. A Promise represents one eventual value or error, is eager, and settles once. An Observable represents a stream of zero or more values over time, is lazy (nothing runs until subscribe), supports cancellation through unsubscribe, and provides operators such as map, filter, debounceTime, and switchMap for transformation and composition.

### 5. What is dependency injection?

Dependency injection supplies a class or function's dependencies from an external container rather than constructing them internally. It improves testability (inject mocks), configuration, and separation of concerns; Angular and NestJS provide built-in DI systems, for example injecting an @Injectable() service through a constructor or inject().

### 6. Difference between Angular and React?

Angular is a full, opinionated framework using TypeScript, HTML templates with directives, dependency injection, RxJS/signals, two-way binding, and a prescribed structure, which suits large enterprise teams. React is a UI library using JavaScript or TypeScript functions and JSX with one-way data flow and a flexible ecosystem where you pick routing and state tools. Both are component-driven.
