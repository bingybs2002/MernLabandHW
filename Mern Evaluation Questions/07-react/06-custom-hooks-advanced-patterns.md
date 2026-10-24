# Custom Hooks & Advanced Patterns

### 1. What is a custom hook?

A custom Hook is a function whose name begins with use and composes built-in Hooks to share stateful logic between components. It shares behavior, not state instances: each caller receives its own Hook state unless the Hook connects to shared external state.

### 2. What are the rules about using custom hooks?

Call Hooks only at the top level of React function components or other Hooks, never in loops, conditions, callbacks, or classes. Custom Hook names must start with use. React relies on call order to associate Hook state correctly, and the eslint-plugin-react-hooks linter enforces these rules.

### 3. Provide examples of custom hooks you have used (e.g., useLocalStorage, useDebounce, usePagination, useClickOutside).

Examples include useLocalStorage for synchronized persisted state, useDebounce for delayed values in search inputs, usePagination for page state and bounds, useFetch for loading/error/data state with AbortController, and useClickOutside for a document listener with cleanup to close dropdowns. A good Hook owns one coherent behavior and exposes a small API.

### 4. What is a Higher Order Component (HOC)?

A HOC is a function that receives a component and returns an enhanced component, such as withAuth(Component). It was a common pattern for cross-cutting concerns before Hooks; today custom Hooks and composition often provide clearer alternatives.

### 5. What is "HOC hell"? And how do we resolve it?

HOC hell is deeply nested wrappers (withRouter(withAuth(withTheme(Component)))) that obscure the component tree, complicate prop flow, and risk naming or ref collisions. I avoid it with custom Hooks, composition, context used carefully, and transparent component boundaries.

### 6. What is React.PureComponent?

React.PureComponent is a class component that implements a shallow comparison of props and state to skip re-renders when they appear unchanged. It depends on immutable updates and is the class-era analogue of React.memo for function components.
