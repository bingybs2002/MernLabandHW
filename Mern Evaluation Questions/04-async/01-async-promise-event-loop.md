# Async, Promise & Event Loop

### 1. How many threads does Javascript have? Why do we need async / non-blocking operations?

JavaScript executes application code on a single main thread. The browser or Node.js provides host APIs and may use other threads for I/O or background work. Asynchronous APIs let the main thread continue instead of waiting for the operation to finish, so the UI stays responsive and a server can handle many requests.

### 2. Explain the Javascript event loop and how these work together

Synchronous code runs on the call stack. When code calls an async host API (timer, fetch, event listener), the work happens outside the engine; when it completes, its callback is queued. The event loop waits until the call stack is empty, drains the microtask queue, then takes the next macrotask from the callback queue, and the browser may render between tasks.

- **execution context**  
  An execution context is the runtime environment in which JavaScript code executes. It contains variable bindings, scope, this, and function declarations. JavaScript creates global, function, and module execution contexts, and each function call pushes a new one onto the call stack.
- **call stack**  
  The call stack tracks currently executing function calls in last-in, first-out (LIFO) order. A function is pushed when called and popped when it returns. Long-running synchronous code blocks the stack and can freeze the browser.
- **web apis**  
  Web APIs are capabilities provided by the browser, not the JavaScript engine, such as setTimeout, fetch, DOM events, and geolocation. They run outside the call stack and, when finished, hand their callback to the appropriate queue. In Node.js, libuv plays this role.
- **callback queue**  
  The callback queue, commonly called the task/macrotask queue, holds callbacks that are ready to run after the call stack is empty. Examples include setTimeout and DOM event callbacks.
- **macrotask and microtask**  
  Macrotasks/tasks include timers, I/O, and DOM events. Microtasks include Promise reactions (.then/await continuations), queueMicrotask(), and MutationObserver. After each task finishes, JavaScript drains the entire microtask queue before moving to the next task.

### 3. Which task has higher priority? For example, given same delay, setTimeout and Promise.resolve, which one comes out first?

Promise.resolve().then(...) comes out first. Promise reactions are microtasks, while setTimeout() creates a task/macrotask. After synchronous code finishes, all microtasks are processed before the next task, even setTimeout with 0 delay.

### 4. What is callback hell? How do we solve this problem?

Callback hell is deeply nested callbacks that make asynchronous code difficult to read, maintain, and handle errors in. I solve it with named functions, Promises, async/await, centralized error handling, and Promise combinators.

### 5. What is a Promise? Why do we need it?

A Promise represents the eventual result or failure of an asynchronous operation. It has three states: pending, fulfilled, or rejected. Promises make asynchronous operations composable, avoid callback nesting, centralize error handling, and work naturally with async/await.

### 6. What is .then, .catch, and .finally?

then() handles fulfillment and returns a new Promise, which enables chaining. catch() handles rejections from earlier parts of the chain. finally() runs regardless of success or failure, usually for cleanup such as hiding a spinner.

### 7. Why can we not do Promise.then or Promise.catch?

.then() and .catch() are instance methods of a promise object, not static methods of the Promise constructor, so Promise.then(...) is an error. Call them on an instance: Promise.resolve(1).then(...) or fetch(url).then(...). A plain value has no .then until it is wrapped with Promise.resolve(). The static methods are Promise.resolve, reject, all, allSettled, race, and any.

### 8. How do we handle multiple promises like concurrent API requests?

Start independent Promise-returning operations together and use Promise.all() when every result is required. Use Promise.allSettled() when partial results are useful, Promise.race() for timeouts, and Promise.any() when the first success is enough.

### 9. What is the difference between Promise.all and Promise.allSettled?

Promise.all() fulfills with all results in input order but rejects as soon as any input rejects. Promise.allSettled() waits for every Promise and returns each result's status, value, or reason, so one failure does not lose the other results.

### 10. Why would we need Promise.race?

Promise.race() settles when the first input Promise settles, whether fulfilled or rejected. It is commonly used for timeouts (race a request against a timer that rejects). However, racing does NOT automatically cancel the original operation; use AbortController for that.

### 11. Difference between using .then and .catch, vs using async/await for promises. Which syntax should we use and why?

I use async/await for clarity and easier debugging, and .then for one-liners. An async function always returns a promise. await pauses that function until the promise settles, so async code reads top to bottom like sync code, and errors are handled with try/catch instead of .catch. Under the hood it's still promises. For parallel work I still use Promise.all.

### 12. How to call a few api’s in parallel vs in sequence? When should you do each

Parallel: start independent requests together, const [a, b] = await Promise.all([getA(), getB()]), to reduce total latency. Sequence: await one after another when the next request depends on the previous result, such as fetching a user and then that user's orders, or when you must respect rate limits or ordering.
