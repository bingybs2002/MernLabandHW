# Modules

### 1. What is a js module and why do we use it?

A module is a file with explicit import and export statements. Modules provide encapsulation, reusable code, clearer dependencies, and separate scopes. Bundlers can also optimize modules through techniques such as tree shaking.

### 2. What is the difference between CommonJS and ES modules?

CommonJS uses require() and module.exports, loads synchronously at runtime, and is traditionally associated with Node.js. ES modules use static import/export syntax, are analyzable at build time (enabling tree shaking), support top-level await, and are the standard module system for modern JavaScript in browsers and Node.

### 3. Difference between default export and named export. How are they imported?

A module can have at most one default export, which can be imported using any name: import Button from './Button'. A module can have multiple named exports, which are imported using their exported names in braces or aliases: import { useAuth, login as signIn } from './auth'.
