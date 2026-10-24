# Functions

### 1. What is the difference between console.log(foo) and console.log(foo())?

console.log(foo) logs the function object itself. console.log(foo()) invokes the function first and logs its returned value; it can also cause side effects or throw.

### 2. What is the difference between func(callback) and func(callback())?

func(callback) passes a function for func to invoke later. func(callback()) invokes callback immediately and passes its result, which is only correct when the parameter expects that result.

### 3. Explain the "Rest Parameter" (...args) and how it differs from the spread operator?

Rest collects remaining function arguments into an array, as in function f(...args). Spread expands an iterable or object's properties into another call, array, or object; the syntax is the same but its direction differs: rest gathers, spread expands.

### 4. How to define Default Parameters for a function?

Default parameters assign a value when an argument is undefined, as in function f(limit = 10). They do not apply to null, which lets callers intentionally pass an empty value.

### 5. Why use arrow functions? What is a problem that it solves?

Arrow functions are concise and lexically capture this from their surrounding scope, which avoids common callback-context bugs (for example inside setTimeout or array callbacks in a method). They cannot be constructors and do not have their own arguments object, so methods that need dynamic this usually use normal functions.

### 6. What is an arrow function’s implicit return and explicit return?

An expression-bodied arrow implicitly returns its expression: x =&gt; x * 2. A block-bodied arrow requires return explicitly: x =&gt; { return x * 2; }, which is needed for multiple statements.

- **How do you implicitly return an object literal?**  
  Wrap the object in parentheses so braces are read as an expression rather than a function body: () =&gt; ({ id: 1 }). Without parentheses, the arrow body is a block and returns undefined unless return is used.

### 7. What is an IIFE (Immediately Invoked Function Expression), and its purpose and use cases?

An IIFE is a function expression invoked immediately, commonly written (() =&gt; { ... })(). It historically created private scope before modules and let/const; today modules are generally clearer, but IIFEs still appear in isolated initialization code and for running top-level async code: (async () =&gt; { await main(); })().

### 8. What is a "Higher-Order Function" and its purpose? Provide 3 examples of a built-in JavaScript HOF.

A higher-order function takes a function as an argument, returns a function, or both. Built-in examples include map, filter, and reduce (also setTimeout and addEventListener); they make transformations declarative and reusable.

### 9. What is a "Callback Function"?

A callback is a function passed to another function to be called later or at a specific point. It is used for events, asynchronous results, and iteration, although Promises and async/await avoid deeply nested callback flows.

### 10. What is function currying?

Currying transforms a function that accepts multiple arguments into a sequence of one-argument functions, such as add(a)(b). It enables partial application and reusable configured functions, but can be less readable when overused.
