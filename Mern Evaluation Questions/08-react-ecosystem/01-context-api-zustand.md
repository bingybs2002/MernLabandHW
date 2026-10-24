# Context API & Zustand

### 1. What is the Context API? How does it solve the prop drilling problem?

Context provides a value to any descendant without manually passing it through every intermediate prop. A Provider high in the tree supplies the value, and any component below reads it with useContext, so the components in between no longer forward props. It solves prop drilling for genuinely shared concerns such as theme, locale, or authenticated identity.

### 2. What happens if useContext is called with no matching Provider above it?

useContext returns the default value passed to createContext(default). React doesn't throw or warn, so a missing Provider fails silently. Fix: use a null default plus a custom hook that throws when the context is null, e.g. if (!ctx) throw new Error('useAuth must be used within AuthProvider').

### 3. Explain createContext(), useContext, Context Provider, and Context Consumer.

createContext creates a context object with a default value. A Provider (&lt;ThemeContext.Provider value={...}&gt;, or just &lt;ThemeContext value={...}&gt; in React 19) supplies a value to descendants; useContext reads the closest Provider in function components. Consumer is the older render-prop API (&lt;ThemeContext.Consumer&gt;{value =&gt; ...}&lt;/ThemeContext.Consumer&gt;) and is rarely needed with Hooks.

### 4. Why is Context API considered bad for performance in large-scale apps?

When a Provider value identity changes, every consumer of that context re-renders, even if it reads only one field; there are no selectors. I split contexts by change frequency, memoize provider values where useful, or use selector-based stores such as Zustand or Redux for frequently changing global state.

### 5. When would a Context Consumer component re-render?

It re-renders when its nearest Provider receives a value that is not Object.is-equal to the prior one, and also when its parent renders unless other memoization avoids it. Stable object and function identities matter for provider values, so I wrap the value in useMemo.
