# Data Types & Coercion

### 1. What are the 7 primitive data types in JavaScript, and how are they stored in memory compared to Objects?

The seven primitives are string, number, bigint, boolean, undefined, symbol, and null. Primitives are immutable values copied by value; objects (including arrays and functions) are mutable, live in heap memory, and variables hold references to them.

### 2. What is the difference between undefined, null, and “not defined”?

undefined means a declared value has not been assigned or a property is absent. null is an intentional empty value. A not-defined identifier was never declared in accessible scope, so reading it throws a ReferenceError.

### 3. What is type coercion? Is it good, how do we deal with it?

Type coercion is JavaScript converting values automatically, for example a string during concatenation or comparison. It can be useful when understood, but I prefer explicit conversions (Number(), String()) and strict equality to avoid surprising bugs.

### 4. Difference between == vs ===, and which one should we use?

== compares after coercion, so values of different types can compare equal ('1' == 1 is true). === compares value and type without coercion (but NaN === NaN is false). I use === by default and Object.is when its edge-case semantics are needed.

### 5. Explain the difference between "Pass by Value" and "Pass by Reference" with examples.

JavaScript always passes values. Primitive values are copied directly, while an object value is a copied reference to the same object, so mutation through either variable is visible but reassigning one variable is not.

### 6. Why does [] == [] and {} == {} return false in JavaScript?

Arrays and objects are compared by identity, not structural contents. Each literal creates a distinct object reference, so two separately created empty arrays or objects are not the same value.
