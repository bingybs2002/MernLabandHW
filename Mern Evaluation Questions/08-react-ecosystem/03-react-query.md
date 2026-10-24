# React Query

### 1. Explain the difference between client-side state and server-side state.

Client state is UI-owned data such as modal visibility, filters, theme, and unsaved form input; the app is its source of truth. Server state is remote, asynchronous, shared, cacheable data owned by the backend that can become stale, so it needs fetching, caching, invalidation, retries, and synchronization policies.

### 2. What is React Query? What features does it provide and what problems does it solve?

React Query (now TanStack Query) is a server-state library for fetching, caching, and synchronizing remote data. You give useQuery a queryKey (such as ['users', userId]) and a queryFn, and it returns data, isLoading, error, and more. Features: a cache keyed by queryKey; deduping of identical in-flight requests; stale-while-revalidate with configurable staleTime; automatic background refetch on mount, window focus, or reconnect; retries with backoff; pagination and infinite queries; prefetching; useMutation with query invalidation and optimistic updates; DevTools. Problems it solves: the boilerplate of hand-rolled useEffect fetching (loading/error flags, race conditions, cancellation), duplicate requests from multiple components, stale data after mutations, and putting server data into Redux. It complements, rather than replaces, client-state tools like Redux or Zustand.
