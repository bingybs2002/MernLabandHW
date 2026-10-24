# Comprehensive React Questions

### 1. Talk about your experience with React hooks?

I use Hooks to colocate state, effects, and reusable behavior in function components. I keep effects focused on external synchronization, use custom Hooks for repeatable patterns, respect dependency linting, and profile before adding memoization.

### 2. Tell me about how you design your React folder structure?

I organize by feature/domain rather than by file type for anything non-trivial. Each feature folder holds its components, hooks, services, and tests, with shared UI, hooks, and utilities in common folders. This keeps related code together, improves cohesion, and makes the app easier to navigate and scale.

### 3. Tell me about how you can keep your React app code clean?

I keep components small and single-purpose and extract reusable logic into custom hooks. I use a consistent folder structure (feature-based), clear naming, and TypeScript for safety. I avoid prop drilling with Context or a state library, keep server state in React Query, and use ESLint, Prettier, and Husky pre-commit hooks. I follow DRY and SOLID where they fit, write tests, and rely on code reviews.

### 4. How do you identify and improve your React app’s performance?

I start by measuring the bottleneck with React DevTools Profiler, Lighthouse, and the browser Performance tab rather than optimizing blindly. Then I use code splitting/lazy loading, memoization such as React.memo/useMemo/useCallback when it actually prevents expensive work, virtualization for large lists, pagination/infinite scrolling, debouncing/throttling, efficient data structures, caching, and optimized network/image loading. For expensive CPU work, I can use Web Workers. React transitions can keep non-urgent UI updates responsive.

### 5. Real-time Scenario: How would you fix a UI that freezes while a user is typing in an input?

The cause is usually expensive work on every keystroke, such as filtering a big list or re-rendering a large tree. First I profile with the React DevTools Profiler. Then I debounce the expensive work, use useDeferredValue or useTransition to keep typing urgent, memoize (useMemo, React.memo), virtualize long lists, move state down so fewer components re-render, and offload heavy computation to a Web Worker.
