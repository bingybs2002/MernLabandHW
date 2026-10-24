# Node.js Core

### 1. What is Node.js?

Node.js is a JavaScript runtime built on V8 that executes JavaScript outside the browser. Its event-driven, non-blocking I/O model is well suited to network services, APIs, tooling, and real-time applications.

### 2. What does "Node is single-threaded" mean? Is it good for CPU-intensive tasks, why?

Application JavaScript normally executes on one event-loop thread, so only one callback runs at a time, while I/O is delegated to the OS or libuv's thread pool. It is not good for CPU-intensive tasks such as image or video processing, large cryptography, compression, or complex analytics: long CPU work occupies the only JavaScript thread, so one blocking call delays timers, I/O callbacks, and every other in-flight request. For that work I use worker_threads, a job queue, a separate service, or native tooling.

### 3. What is an I/O operation, and why does it make Node fast for this kind of work?

I/O is waiting for external systems such as network sockets, files, databases, or DNS. Node starts many I/O operations asynchronously, lets the OS or libuv wait for them, and uses the event loop to handle completions, so one thread can juggle thousands of waiting requests without blocking.

### 4. What is the V8 engine?

V8 is Google's high-performance JavaScript and WebAssembly engine, used by Chrome and Node.js. It parses and JIT-compiles JavaScript to machine code and manages memory and garbage collection, while Node supplies the server-side APIs (fs, http) around it.

### 5. How does the Node.js event loop work? How could it handle thousands of concurrent requests?

Node runs synchronous code on the call stack, then cycles through event-loop phases: timers (setTimeout/setInterval), pending callbacks, poll (I/O), check (setImmediate), and close callbacks. It drains process.nextTick and Promise microtask queues between callbacks. It handles thousands of concurrent requests because each request mostly waits on I/O: Node starts the I/O, registers a callback, and immediately serves the next request instead of dedicating a blocked thread to each connection.

### 6. How is Node.js event loop different from the browser's event loop?

Both run JavaScript tasks and microtasks, but Node integrates libuv phases, a thread pool, process.nextTick, setImmediate, and server I/O primitives. Browsers additionally coordinate rendering, user input, DOM APIs, and frame scheduling (requestAnimationFrame).

### 7. What is libuv?

libuv is Node's cross-platform asynchronous I/O library written in C. It provides the event loop, a thread pool (default 4 threads for fs, DNS, crypto, zlib), networking, filesystem abstractions, timers, and platform-independent behavior that Node uses beyond the V8 engine.

### 8. What is setImmediate?

setImmediate schedules a callback for Node's check phase, after I/O polling in the current iteration. Its exact order relative to setTimeout(0) can depend on context (inside an I/O callback, setImmediate always runs first); I use it only when the scheduling distinction is meaningful.

### 9. What is process.nextTick()?

process.nextTick queues a callback to run right after the current operation, before the event loop continues and before normal Promise microtasks in Node. It is useful for API consistency but excessive recursion can starve I/O, so I use it sparingly.

### 10. What are macrotasks and microtasks? Give examples of each.

Macrotasks include setTimeout/setInterval callbacks, I/O callbacks, and setImmediate callbacks. Microtasks include Promise reactions and queueMicrotask, while process.nextTick has its own higher-priority queue; overusing either can delay I/O progress.

### 11. What is the scripts field in package.json? How do you run one?

scripts maps friendly command names to shell commands, such as "dev": "nodemon src/index.js" or "test": "jest". I run one with npm run dev; built-ins such as npm start and npm test work without run. Scripts standardize workflows across developers and CI, and locally installed binaries in node_modules/.bin are on the path.

### 12. Difference between npm and yarn? Just briefly

Both are package managers that install dependencies from the npm registry using package.json. Yarn (from Facebook, 2016) originally added lockfiles, faster parallel installs, and workspaces; npm has since caught up with package-lock.json and workspaces. Yarn Berry adds Plug'n'Play, and pnpm is another fast, disk-efficient option. The practical rule: use the one whose lockfile the project already has, and don't mix them.

### 13. What is a .env file? What do we put in it?

A .env file stores environment-specific configuration such as PORT, DATABASE_URL, API base URLs, feature flags, and local secrets, loaded into process.env (via dotenv or node --env-file). I add it to .gitignore, commit a .env.example template instead, validate required values at startup, and use a secrets manager rather than plain files in production.

### 14. How do you start a Node.js project after cloning it?

I read the README and package.json, install the required Node version (nvm use with .nvmrc), copy .env.example to .env and configure local values, run npm ci (or the prescribed package-manager install), start dependencies such as the database (often docker compose up), run migrations if needed, then run the documented dev or test script.

### 15. Explain core Node.js modules and variables like os, fs, path, and env.

os provides operating-system information (CPU count, memory, platform); fs reads and writes files (prefer fs/promises); path safely builds and resolves file paths across operating systems (path.join, path.resolve); and process.env exposes environment variables. Other common core modules include http, crypto, stream, events, and url; I prefer built-ins when they meet the need.
