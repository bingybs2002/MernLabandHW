# Hooks

### 1. Explain how useState works.

useState creates state owned by a function component and returns the current value plus a setter: const [count, setCount] = useState(0). Calling the setter schedules a render with a new snapshot; it does not mutate the variable in the current render. React keeps the value between renders based on hook call order.

### 2. What are different ways of calling setState?

I can pass a next value when it does not depend on prior state (setName('Ann')), or an updater function such as setCount(c =&gt; c + 1) when it does. I use the updater form for repeated, asynchronous, or batched updates to avoid stale snapshots. useState also accepts a lazy initializer, useState(() =&gt; expensiveInit()), which runs only on the first render.

### 3. How do you queue a series of state updates?

React queues setter calls and processes them during the next render. Multiple updater functions run in order against the pending value, so setCount(c =&gt; c + 1) three times reliably increments by three, whereas setCount(count + 1) three times only increments by one.

### 4. Why is it that, when you console.log the state after calling setState, the value is the old value?

Each render sees an immutable snapshot of state. The setter requests a future render, so code already running still closes over the current snapshot; I observe the updated value in the next render or in an effect that depends on it.

### 5. How does useEffect work, and what is its purpose?

useEffect runs after React commits a render so a component can synchronize with an external system such as an API, subscription, timer, or browser API. It may return cleanup, which runs before a changed effect reruns and on unmount.

### 6. Explain the dependency array in useEffect (empty, none, and with dependencies).

No dependency array means the effect runs after every committed render. An empty array means it runs once after initial mount (cleanup on unmount); listed dependencies rerun it when any of them changes (compared with Object.is). Dependencies should include every reactive value the effect reads.

- **Another way of asking: How does useEffect mimic the component lifecycles?**  
  An effect with [] resembles componentDidMount and its cleanup resembles componentWillUnmount, while an effect with dependencies resembles componentDidUpdate for those values. It is better understood as synchronization per render than as a direct lifecycle-method replacement.

### 7. How do we clean up in useEffect, and why is it necessary?

An effect returns a cleanup function, for example removing an event listener, clearing a timer, aborting a request, or closing a socket. Cleanup prevents memory leaks, duplicate subscriptions, and stale updates when dependencies change or a component unmounts.

### 8. How do you clean up a setTimeout or setInterval?

I store the timer handle returned by setTimeout or setInterval and return a cleanup that calls clearTimeout or clearInterval: useEffect(() =&gt; { const id = setInterval(tick, 1000); return () =&gt; clearInterval(id); }, []). This ensures timers do not fire after unmount or after their inputs have changed.

### 9. Why might a useEffect call run multiple times unexpectedly, and how do you avoid infinite re-rendering?

Effects rerun when a listed dependency changes identity or value; objects, arrays, and functions created during render are new every time. StrictMode also runs effects twice in development. An infinite loop occurs if an effect updates state that changes one of its own dependencies on every run; I correct the dependency design, stabilize values with useMemo/useCallback where justified, use updater functions, or move event-driven work out of the effect.

### 10. What is the difference between handling side effects inside useEffect versus event handlers?

Event handlers are best for work caused by a deliberate user action, such as submitting a form. Effects are for keeping the rendered UI synchronized with external systems because it is displayed; putting click-driven actions in effects often causes duplicate or surprising work.

### 11. What is useLayoutEffect?

A version of useEffect that runs after React updates the DOM but before the browser paints. Use it to measure layout or adjust the DOM before the user sees anything (avoids flicker, e.g. tooltip positioning). It blocks painting, so prefer useEffect otherwise.

### 12. What is useRef, and what are different ways to use it?

useRef holds a stable mutable object whose .current persists across renders without causing re-renders. I use it for DOM nodes (focus an input, measure size), timer or subscription handles, previous values, and imperative integration state—not for data that should drive UI.

### 13. What is the difference between useState and useRef?

State changes schedule a render and should represent visible UI data. Ref changes do not schedule a render and are suited to mutable implementation details or DOM references; using refs for displayed state creates stale UI.

### 14. What is useReducer?

A Hook for managing component state with a reducer: const [state, dispatch] = useReducer(reducer, initialArg, init?). dispatch(action) runs reducer(state, action) to compute the next state. Use it when state transitions are complex or interrelated, such as multi-field forms or a fetch state machine (loading, success, error).

### 15. What is the difference between useMemo and useCallback?

useMemo caches a calculation's result until its dependencies change. useCallback caches a function reference (the function still runs when called). useCallback(fn, deps) is equivalent to useMemo(() =&gt; fn, deps).

- **What is useMemo?**  
  A Hook that caches a computed value until its dependencies change. Use for: skipping expensive calculations; preserving reference equality for React.memo; stabilizing hook dependencies. Don't use for: every function or variable, cheap calculations, or a child that isn't wrapped in React.memo.
- **What is useCallback?**  
  A Hook that caches a function definition between re-renders: const cachedFn = useCallback(fn, dependencies). It helps only when a stable callback prevents meaningful downstream work (a React.memo child or an effect dependency); otherwise an inline function is clearer.

### 16. What is the difference between useMemo and React.memo?

useMemo is a Hook that caches the result of a calculation inside a component between re-renders. React.memo is a higher-order component that wraps a whole component and skips re-rendering it when its props are shallowly equal to the previous props.
