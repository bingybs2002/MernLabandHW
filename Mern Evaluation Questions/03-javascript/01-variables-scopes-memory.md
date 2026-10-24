# Variables, Scopes & Memory

### 1. What is the difference between let, const, and var?

let is block-scoped and reassignable; const is block-scoped and cannot be reassigned; var is function-scoped, can be redeclared, and is hoisted as undefined. I default to const, use let for reassignment, and avoid var because hoisting and function scope cause surprises.

### 2. Can you modify the properties of an object declared with const? Why or why not?

Yes. const prevents rebinding the variable, not mutating the object it references, so obj.name = 'x' is allowed but obj = {} is not. For immutability I create a new object or use Object.freeze (which is shallow).

### 3. Explain the difference between "Pass by Value" and "Pass by Reference" with examples. (aka. primitive vs reference types)

JavaScript always passes values. Primitive values are copied directly, so changing a copied number does not affect the original. An object value is a copied reference to the same object, so mutation through either variable is visible (function f(o) { o.x = 1 } changes the caller's object), but reassigning the parameter (o = {}) does not affect the caller.

### 4. Explain the difference between Global Scope, Function Scope, and Block Scope.

Global bindings are broadly accessible and risk collisions. Function scope limits var and function declarations to a function; block scope limits let and const to braces such as if or for. I minimize globals and keep state in the narrowest useful scope.

### 5. Define "Closure" in your own words. What is its purpose?

A closure is a function together with access to its surrounding lexical environment after the outer function has returned. It enables encapsulated state, callbacks, factories, memoization, and React hooks, but can retain memory longer than intended.

### 6. What is a "private variable," and how does a closure create one?

An outer function keeps a variable inaccessible directly and returns functions that can read or change it. Only those functions hold the closure, so callers use a controlled API rather than touching the state itself. Example: function counter() { let count = 0; return { inc: () =&gt; ++count }; }.

### 7. What is hoisting?

Hoisting describes how declarations are registered before code executes in a scope. Function declarations are callable early, var is initialized as undefined, and let/const/class exist but remain in the temporal dead zone until their declaration runs, so accessing them early throws a ReferenceError.

### 8. How could the Global/Window object potentially cause memory leaks in Javascript?

Globals can keep objects, timers, listeners, and closures reachable for the page lifetime, preventing garbage collection. Accidental globals (assigning to an undeclared variable in sloppy mode) make this worse. I avoid attaching application state to window and clean up listeners, timers, subscriptions, and references when features unmount.
