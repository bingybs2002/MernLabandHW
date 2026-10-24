# Rendering and Lifecycle

### 1. What causes a React component to re-render?

A component re-renders when its state setter runs with a new value, its parent re-renders, a consumed context value changes, or an external-store subscription reports a change. A re-render recalculates the element tree; React commits DOM changes only where the output differs.

- **how do we prevent unnecessary re-rendering**  
  Measure first with the React DevTools Profiler. Then move state down, pass children instead of rendering inside a stateful parent, wrap expensive children in React.memo, keep props stable with useMemo/useCallback, and split contexts. A memoized component still re-renders when its own state or a context it reads changes. React Compiler can automate much of the memoization.

### 2. Explain keys in a list

Keys give React stable identity for each sibling across renders so it can match old and new list items correctly.

- **purpose**  
  Keys let React preserve the correct component state and DOM node for each item, and efficiently insert, remove, or reorder elements instead of re-creating or mismatching them.
- **requirements**  
  A key must be unique among its siblings (not globally), stable across renders for the same item, and derived from item identity such as a database ID. It should not be generated during render (Math.random() or crypto.randomUUID() inline), because a new key each render remounts the item.
- **can we use index?**  
  Only for a truly static list with no IDs, no reordering, no insertions or deletions, and no item-local state. Otherwise an index changes when items move, so React associates state, input values, and DOM with the wrong item.

### 3. What is a pure function?

A pure function returns the same output for the same inputs and has no side effects. A side effect is changing something outside the function (mutating inputs or globals, network calls, DOM writes, timers). Reading changing outside values (Date.now(), Math.random()) isn't a side effect, but it still makes a function impure because its output isn't deterministic.

### 4. What does it mean for a Component to be "Pure"?

A pure component derives its output only from its props, state, and context, with no mutation, network calls, timers, or DOM writes during render. Given the same inputs it always renders the same JSX, which is what lets React safely skip, reorder, or re-run renders.

### 5. What are considered side effects in React components? Where should we handle them?

Side effects include network calls, subscriptions, timers, logging, storage, and imperative DOM work because they reach outside rendering. I handle user-caused effects in event handlers and synchronization with external systems in useEffect, or useLayoutEffect when layout timing is necessary. Never during render.

### 6. What is React.StrictMode, and why does it render everything twice?

StrictMode is a development-only tool that helps find bugs early. It double-invokes renders to catch impure components and runs effects mount, cleanup, mount to catch missing cleanup. It also warns about deprecated APIs. None of this happens in production. If a component breaks under StrictMode, its render isn't pure or an effect isn't cleaning up.

### 7. What are mounting and unmounting in a component's lifecycle?

Mounting is when React creates a component and commits it to the UI for the first time. Unmounting removes it; effects must clean up subscriptions, timers, requests, and imperative resources so removed components do not leak or update stale state. Between them, the component updates whenever it re-renders.

### 8. What are the class component lifecycle methods?

Common class lifecycle methods are constructor for initial state, render to return UI, componentDidMount for post-mount work, shouldComponentUpdate to skip renders, componentDidUpdate for reacting to updates, and componentWillUnmount for cleanup. Modern function components usually express these concerns with useEffect and its dependency array.
