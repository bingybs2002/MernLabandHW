# Error Handling

### 1. How do Error Boundaries work, and why can they only be built using class components?

An Error Boundary is a class component that catches errors thrown while rendering, in lifecycle methods, or in constructors of its descendants, and shows a fallback UI instead of unmounting the whole app. static getDerivedStateFromError switches to the fallback; componentDidCatch logs the error (e.g. to Sentry). Why a class: those two methods have no Hook equivalent, so function components can't be boundaries. In practice, write one class boundary or use react-error-boundary and wrap function components with it.

### 2. What kind of errors can you use Error Boundaries to handle?

They catch errors during rendering, lifecycle methods, and constructors below the boundary. They do not catch event-handler errors, asynchronous callbacks (setTimeout, promises), server rendering errors, or errors thrown inside the boundary itself; those need local try/catch or framework-level handling.

### 3. How do you gracefully handle errors when an API call from React fails?

Detect failures: fetch only rejects on network errors, so check response.ok and throw on 4xx/5xx. Track loading, error, and data states; show a clear error message with a Retry button, not a blank screen. If stale data exists, keep showing it with a small warning. Tailor the message: 401 redirects to login, 404 shows not found, 5xx/network errors suggest trying again. Use TanStack Query for error states, automatic retries with backoff, and caching. Wrap sections in error boundaries so a render error shows a local fallback, and log errors to Sentry.
