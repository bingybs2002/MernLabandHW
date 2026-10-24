# Copying & Mutability

### 1. How does the "Shallow Copy" differ from a "Deep Copy"? How do you do a shallow copy?

A shallow copy creates a new outer container but shares nested object references; spread ({ ...obj }, [...arr]), Object.assign, and slice are common shallow copies. A deep copy recursively duplicates nested data so mutations do not leak, using structuredClone or a domain-aware cloning approach.

### 2. What are the ways to perform deep cloning?

structuredClone is the modern default for supported cloneable values. For domain models I often map fields explicitly; libraries such as lodash cloneDeep handle special cases. JSON serialization is only appropriate for simple JSON-safe data because it loses types and fails on cycles.

### 3. What are the limitations of using JSON.parse(JSON.stringify(obj)) for deep cloning?

JSON.parse(JSON.stringify(value)) drops undefined, functions, symbols, and non-enumerable values; converts dates to strings; loses Maps, Sets, and prototypes; cannot serialize BigInt; and throws on circular references. It should not be treated as a general deep clone.

### 4. What is structuredClone?

structuredClone is a built-in API that deep-clones most built-in types (Date, Map, Set, typed arrays, and more), handles circular references, and supports transferable objects. It throws on functions and DOM nodes, and class instances lose their prototype.

### 5. Explain the "Spread Operator" (...) and how it behaves when merging objects with conflicting keys.

Object spread copies own enumerable properties into a new object, shallowly. When keys conflict, properties from the later spread win, for example { ...defaults, ...overrides }. Array spread expands iterable values into a new array or argument list.
