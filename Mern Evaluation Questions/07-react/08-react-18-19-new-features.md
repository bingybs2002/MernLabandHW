# React 18 & 19 New Features

### 1. What is useTransition?

A Hook that marks a state update as non-urgent so the UI stays responsive: const [isPending, startTransition] = useTransition(). Urgent updates such as typing render first, while the transition (for example filtering a large list) can be interrupted. isPending is true while the transition is rendering.

### 2. What is automatic batching update for states? Since which version is it supported?

Automatic batching groups multiple state updates into one render to reduce unnecessary work. Since React 18, batching applies beyond React event handlers to updates in promises, timeouts, and native events when using the createRoot API; before React 18 only event-handler updates were batched.

### 3. What is React Compiler in React 19?

React Compiler is a build-time optimizer that automatically memoizes eligible components and values based on static analysis. It aims to reduce manual useMemo, useCallback, and React.memo, but components must follow React rules and code should remain correct without relying on optimization.

### 4. What are server components in React 19?

Server Components render on the server and can access server-side data or resources without shipping their component code to the browser. They compose with Client Components ('use client') for interactivity, reducing client JavaScript while requiring a compatible framework such as Next.js App Router and clear server-client boundaries.

### 5. What is the "use" API in React 19?

use reads a Promise or context during rendering and integrates with Suspense, allowing React to suspend until the resource resolves. Unlike other Hooks, it can be called inside conditions and loops. It must be used with appropriate boundaries and a framework-supported data strategy; it changes rendering flow rather than replacing all effects.
