# TypeScript Foundations

### 1. What is the difference between JavaScript and TypeScript? Which should be preferred by companies and why?

TypeScript is JavaScript plus static type checking and tooling; it compiles to JavaScript and does not change runtime behavior by itself. I generally prefer it for shared production code because types catch integration errors early and improve refactoring and autocomplete, while accepting a small learning and build-cost tradeoff.

### 2. What is the difference between any and unknown & Which is Safer?

any disables type checking and can spread unsafety through the codebase. unknown accepts any value but must be narrowed (typeof, instanceof, a type guard, or schema validation) before use, making it the safer choice at boundaries such as API responses or JSON.parse results.

### 3. What is the difference between void and never, when are they used?

void means a function returns no useful value. It completes normally, but the caller should not use the result (for example, event handlers or console.log). never means a function never returns: it always throws or loops forever. It also marks impossible states, such as the remaining case in an exhaustive switch, which gives compile-time exhaustiveness checks. In short, void returns nothing, while never does not return at all.

### 4. Difference between interface vs. type, and which one should we use?

Both describe shapes and can be extended. Interfaces are especially suited to object contracts and support declaration merging; type aliases can express unions, intersections, mapped types, tuples, and primitives. I choose the clearer fit and stay consistent in a codebase.

### 5. Can Chrome run a .ts file directly? Or, can typescript run in the browser? Why?

No. Browsers only understand JavaScript (and WebAssembly), so TypeScript must first be transpiled to JS with tsc, Babel, esbuild, SWC, or a tool like Vite or webpack. Types exist only at compile time and are erased, so there is no runtime type checking. Some runtimes (Deno, Bun, and newer Node versions) can run TS directly by stripping types, but not the browser.

### 6. What are generics? What are their use cases?

Generics let you write code that works over many types while keeping the type relationship intact. For example: function first&lt;T&gt;(items: T[]): T | undefined. They give reusable, type-safe abstractions without falling back to any.

- **Give examples of when you would use generics?**  
  A typed API wrapper: fetchJson&lt;T&gt;(url): Promise&lt;T&gt;. A reusable hook: useFetch&lt;T&gt;() or useLocalStorage&lt;T&gt;(). A generic UI component: Table&lt;T&gt; or Select&lt;T&gt; typed to its rows/options. A constrained helper: &lt;T extends { id: string }&gt; so it can safely read item.id. Anywhere you want one reusable, type-safe function instead of duplicating it or falling back to any.

### 7. What are union and intersection types?

A union, A | B, means a value can be one of several alternatives and requires narrowing before using variant-specific fields. An intersection, A & B, combines required members from multiple types, useful for composing compatible object contracts.

### 8. How do you explicitly mark parameter types and return types in arrow functions?

I annotate parameters inside the parentheses and the return type after the parenthesis: const add = (a: number, b: number): number =&gt; a + b;. For generics: const identity = &lt;T,&gt;(x: T): T =&gt; x;. I can also type the variable with a function type: type Fn = (a: number) =&gt; string; const f: Fn = (a) =&gt; String(a);. For callbacks like React handlers I type the event too: (e: React.ChangeEvent&lt;HTMLInputElement&gt;): void =&gt; {}.

### 9. How do you define optional properties in an interface?

Mark the property with a ?: interface User { id: string; nickname?: string; }. An optional property may be omitted, and its type becomes the declared type or undefined. This differs from a nullable property, which exists but may be null.

### 10. How and when would you use Type Assertion (as)?

A type assertion tells the compiler to treat a value as a specific type. It is erased at compile time and does no runtime check, so a wrong assertion fails at runtime. Example: const input = document.getElementById('email') as HTMLInputElement;. The angle-bracket form &lt;HTMLInputElement&gt;value also works, but not in .tsx files. Use it only when you know more than the compiler.

### 11. How and when would you use the Non-null Assertion operator (!)

The postfix ! (e.g. user!.name) tells the compiler a value is not null or undefined. It is erased at compile time and does no runtime check, so use it only when you can guarantee the value exists (e.g. an element you know is in the DOM, like document.getElementById('root')!); otherwise narrow the type or use ?..

### 12. What are Enums and why do we need them?

Enums create named constant sets (numeric or string), giving meaningful names to related values such as OrderStatus.Paid. I often avoid them because they emit runtime code (not erasable syntax), numeric enums are loosely typed, and string enums are nominal. A union of string literals or an as const object is frequently a lighter alternative.
