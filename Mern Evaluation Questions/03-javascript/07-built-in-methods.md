# Built-in Methods

### 1. Which of the following Array methods mutate (modify) the original array, and which return a new array? map(), filter(), push(), pop(), slice(), splice(), sort() (You can ask one by one)

push, pop, splice, and sort mutate the original array. map, filter, and slice return new arrays; I avoid in-place mutation for state updates and use copies such as [...items].sort() or toSorted() when necessary.

### 2. What is the difference between Array.prototype forEach and map, and filter?

forEach runs a callback for side effects and returns undefined. map transforms every element into a same-length new array. filter returns a new array containing only elements whose predicate is truthy.

### 3. What does the Array.prototype.reduce method do?

reduce combines an array into one accumulated value by applying a reducer for each item. It can calculate totals, build objects, group data, or flatten structures; I provide an initial value to make empty-array behavior explicit.

### 4. Can you break out of a forEach loop? If not, what should you use instead?

No. forEach has no break or early-return mechanism for its enclosing function. I use for...of with break, a regular loop, or array methods such as some, every, and find when I need early exit.

### 5. Explain the difference between Array.isArray(arr) and typeof arr.

Array.isArray(value) reliably detects arrays, including across realms. typeof [] returns 'object', which is too broad because arrays, plain objects, and null all need more precise checks.

### 6. What is the runtime of sort?

Comparison sorting is typically O(n log n) on average and in the worst case for modern engines (V8 uses TimSort), though the specification does not guarantee one algorithm. The comparison function can dominate cost, and sort mutates its input.

### 7. What are JSON.parse and JSON.stringify?

JSON.stringify converts a JSON-compatible JavaScript value to a string for storage or transport. JSON.parse converts a valid JSON string back into JavaScript data; it throws on invalid JSON, and parsing untrusted data needs validation before use.
