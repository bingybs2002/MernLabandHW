# Redux

### 1. Why do we use Redux?

Redux centralizes predictable shared client state, makes state transitions explicit through actions and reducers, and offers strong debugging (Redux DevTools, time travel), middleware, and ecosystem tooling. It is most valuable when state is complex, cross-cutting, and needs auditability.

- **explain its three core principles**  
  Single source of truth: the whole app state lives in one store. State is read-only: the only way to change it is to dispatch an action. Changes are made with pure functions: reducers take previous state and an action and return new state without mutating or causing side effects.

### 2. Explain the Flux pattern with the following concepts.

Flux is one-way data flow: views dispatch actions, a dispatcher or middleware routes them, stores update state, then views render the new state. Redux is a Flux-inspired architecture with one store and pure reducers.

- **store**  
  The store holds the application's Redux state tree and exposes getState, dispatch, and subscribe. It is created once per application (configureStore) and combines reducers plus optional middleware.
- **reducer**  
  A reducer is a pure function receiving previous state and an action and returning next state. It must not mutate state or perform side effects, which makes transitions testable and supports time-travel debugging.
- **dispatching an action**  
  An action is a plain object describing an event, conventionally with a type and optional payload, such as { type: 'cart/addItem', payload: item }. Dispatching sends it through middleware to the reducers, which decide the resulting state; subscribed components then re-render with the new state.

### 3. How do you read from and write to states in Redux store? Which functions?

Read with useSelector(state =&gt; state.cart.items), which selects data and subscribes the component to relevant changes. Write with useDispatch(): const dispatch = useDispatch(); dispatch(addItem(item)); reducers or Redux Toolkit slice reducers calculate next state. Outside React, store.getState() and store.dispatch() do the same. Components never modify the store object directly.

### 4. What are connect api and mapStateToProps?

connect is React Redux's older higher-order component that connects a class or function component to the store: connect(mapStateToProps, mapDispatchToProps)(Component). mapStateToProps receives store state and returns the props the component needs; mapDispatchToProps binds action dispatchers as props. In modern function components, useSelector and useDispatch are preferred.

### 5. What is Redux Toolkit? How is it different from traditional Redux?

Redux Toolkit is the official recommended Redux approach, providing configureStore, createSlice, Immer-powered "mutating" syntax that produces immutable updates, sensible defaults (DevTools, thunk), createAsyncThunk, and RTK Query. Traditional Redux needed separate action types, action creators, switch-based reducers, and manual store setup; RTK removes that boilerplate while preserving Redux's predictable model.

### 6. What is a redux Redux middleware? Explain these examples

Middleware sits between dispatching an action and the moment it reaches the reducer, enabling logging, async workflows, analytics, error reporting, and other side effects. It can inspect, delay, or transform actions but should keep domain transition logic in reducers.

- **Redux Thunk**  
  Thunk middleware lets dispatch accept a function that receives dispatch and getState, allowing async orchestration (such as fetching data) before dispatching ordinary actions. It is simple, included by default in Redux Toolkit, and createAsyncThunk builds on it.
- **Redux Saga**  
  Saga uses generator functions (function*) to model complex, cancellable, long-running workflows declaratively with effects like call, put, takeLatest, and race. It is more powerful than thunks for orchestration such as debounced searches or retries, but has a steeper learning and maintenance cost.
- **Redux Persist**  
  Redux Persist saves selected Redux state to storage (such as localStorage or AsyncStorage) and rehydrates it on startup. I persist only safe, durable client preferences or drafts, avoid tokens and volatile server caches, version stored data, and handle migration or expiry.

### 7. Explain the differences between Redux and the Context API.

Context is a built-in dependency-injection mechanism with no selectors, middleware, or devtools; every consumer re-renders on value change. Redux is an external store with selectors, middleware, DevTools, and strict conventions. I use Context for stable shared dependencies such as theme, locale, and auth identity, and Redux Toolkit when shared client state has complex transitions, many consumers, or debugging needs.

### 8. How do you choose whether to store data in local state vs global state?

State belongs locally by default. I move it up only to the closest shared owner, and use a global store only if distant parts of the application need coordinated access, persistence, or complex cross-feature transitions. Server data goes into a server-state cache like React Query rather than global client state.
