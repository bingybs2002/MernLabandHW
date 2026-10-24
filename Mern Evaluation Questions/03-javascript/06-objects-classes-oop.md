# Objects & Classes (OOP)

### 1. What is hasOwnProperty? How is it different from directly checking the property from the object using obj.something?

Object.hasOwn(obj, key) or obj.hasOwnProperty(key) checks whether the property belongs directly to that object. obj.something reads both own and inherited properties through the prototype chain, and may return undefined even when an own property exists with value undefined.

### 2. Explain the this keyword.

this is determined by how a normal function is called: a method call usually uses the receiver, a constructor call uses the new instance, and call/apply/bind can set it. Arrow functions do not bind their own this; they capture the surrounding one.

### 3. Give more examples of how this keyword behaves differently in different places.

A method call (obj.fn()) sets this to the receiver obj. A plain function call sets this to undefined in strict mode (or the global object otherwise). An arrow function inherits this from its enclosing scope. A DOM event handler gets this as the element. new Fn() sets this to the new instance. call/apply/bind set this explicitly. Extracting a method (const f = obj.fn; f()) loses the receiver.

### 4. Explain call, apply, and bind. What are their differences?

call invokes a function immediately with a chosen this and individual arguments. apply does the same with an argument array. bind returns a new function with this, and optionally initial arguments, fixed for later invocation.

### 5. Explain the difference between a Class and an Object (Instance).

A class defines shared construction and behavior; an object instance is a concrete object created from that class with new. In JavaScript, classes are syntax over the prototype system, allowing instances to share prototype methods.

### 6. What is the difference between Prototype Methods and Static Methods? Give three examples of a built-in static method of Object, Promise, Array.

Prototype methods are available on instances and share one function through the prototype, such as arr.map(). Static methods belong to the class itself and are called without an instance, such as Object.keys, Promise.all, and Array.isArray.

### 7. What does it mean when we say ES6 Classes are just "Syntax Sugar"?

Classes provide a familiar syntax for constructors, inheritance, and methods, but JavaScript still uses prototypes underneath: methods live on Class.prototype and extends sets up the prototype chain. They improve readability and add stricter semantics, yet the fundamental delegation model remains prototype-based.

### 8. How do you iterate over the keys and values of an Object? Give three ways.

Object.keys(obj) returns own keys, Object.values(obj) returns values, and Object.entries(obj) returns key-value pairs for for...of. for...in also visits inherited enumerable keys, so I use it only with an own-property guard.

### 9. What is destructuring?

Destructuring extracts values from arrays by position or objects by property name into variables. It supports defaults and nested patterns, making function parameters and data access clearer when used without excessive nesting.

- **How do you rename a variable while destructuring?**  
  Use property-name colon local-name syntax: const { api_name: apiName } = response. The source key stays api_name while the local variable follows the project's naming convention.

### 10. Explain Array and Object destructuring difference

Array destructuring is position-based, such as const [first, second] = list, and you can skip items with commas. Object destructuring is property-name-based, such as const { first } = object, so order does not matter.
