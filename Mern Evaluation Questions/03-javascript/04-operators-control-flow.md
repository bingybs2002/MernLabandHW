# Operators & Control Flow

### 1. What is "Short-circuit evaluation" in Logical Operators (&& and ||)?

&& returns the first falsy operand or the last truthy operand, while || returns the first truthy operand or the last falsy operand. JavaScript stops evaluating once the result is known, which supports guards (user && user.name) and defaults but can accidentally skip valid falsy values.

### 2. Explain the difference between the Logical OR operator (||) and the Nullish Coalescing operator (??).

|| falls back for any falsy value, including 0, false, and an empty string. ?? falls back only for null or undefined, so it is safer for defaults when falsy values are legitimate: 0 || 10 is 10, but 0 ?? 10 is 0.

### 3. What is "Falsy" in JavaScript? List all the falsy values you can think of.

The falsy values are false, 0, -0, 0n, an empty string, null, undefined, and NaN. Everything else, including empty arrays and objects, is truthy.

### 4. What is the difference between + between 1 + "1" vs. 1 + 1?

With a string operand, + performs string concatenation, so 1 + '1' produces '11'. With two numbers, it performs arithmetic addition and produces 2; explicit Number conversion avoids accidental coercion.

### 5. How to convert a string type into a number? And vice versa?

I use Number(value) or unary + for a full numeric conversion, parseInt or parseFloat when parsing a prefix is intentional, and String(value), toString(), or template literals for text. I validate the result with Number.isNaN when input can be invalid.

### 6. What are Template Literals / string literal / string interpolation?

Template literals use backticks and support interpolation with ${expression}, multiline strings, and tagged templates. They improve readability for formatted strings; I still avoid inserting untrusted text into HTML.

### 7. What is optional chaining? Demonstrate how to use it.

Optional chaining, such as user?.profile?.name, stops and returns undefined if the value before ?. is null or undefined. It also works for calls and indexes: callback?.() and arr?.[0]. It prevents defensive null checks, but it should not conceal data that the application requires to exist.

### 8. What is the purpose of the finally block in a try...catch...finally statement?

finally runs whether a try block succeeds or throws, even after catch handles an error. I use it for cleanup such as clearing loading state, releasing a resource, or stopping a timer, not for returning values that could hide errors.

### 9. When using switch statements, what happens if you forget the break keyword?

Execution falls through into the next case until it reaches a break, return, throw, or the end. Intentional fallthrough should be explicit and documented; otherwise I use break or return to prevent accidental behavior.
