# Components, Props, and States

### 1. What is a React component?

A React component is a reusable unit of UI that receives props and returns React elements. Function components can hold state and effects through Hooks, enabling composition around a clear input-output boundary. Component names must start with a capital letter.

### 2. What is the difference between state and props?

Props are read-only inputs a parent passes to a component. State is component-owned data that can change over time through setters and triggers a re-render; parents coordinate shared state by lifting it up to the closest common parent.

### 3. Why must array/object state be updated immutably instead of mutated in place?

React uses identity changes (Object.is) to determine when updates occurred, so mutation can leave the reference unchanged and create stale UI or broken memoization. I create new arrays or objects with spread, map, filter, or an immutable update helper such as Immer.

### 4. Is a prop mutable?

Props must be treated as immutable by the receiving component. A child requests changes by calling a callback supplied by its parent; mutating a prop breaks one-way data flow and makes rendering unpredictable.

### 5. What is a "children" prop?

children is the prop containing nested JSX between a component's opening and closing tags. It supports composition, layouts, wrappers, and slots without coupling the parent to the child's specific content.

### 6. What are smart (container) component and dumb (presentation) component?

A container component coordinates data, state, and side effects, while a presentation component focuses on rendering from props. The distinction is a useful separation of concerns, though Hooks often let one well-factored function component handle both cleanly.

### 7. What is a stateless component?

A stateless component has no local state and renders only from props and context. Function components can be stateless, but function components may also use Hooks; the term does not mean a particular component syntax.

### 8. What is the difference between class components and functional components?

Before Hooks (React 16.8, 2019), classes were needed for state and lifecycle methods, using this.state, this.setState, and componentDidMount. Now function components with Hooks do both with less boilerplate and no this binding, and they are the default. Classes remain for Error Boundaries and legacy code.

### 9. What are Fragments in React and why do we use them?

Fragments group multiple children without adding an extra DOM node, using empty-tag syntax (&lt;&gt;...&lt;/&gt;) or React.Fragment. They keep markup valid and avoid layout or accessibility side effects from unnecessary wrapper elements; the full syntax can carry a key.

### 10. What is prop drilling? Is it good? If not, how do we deal with it?

Prop drilling is passing props through components that do not use them solely to reach a deep child. It is fine for one or two levels but becomes brittle deeper. I first prefer composition or colocated state, then use Context for broadly shared low-frequency data, or a state library for complex cross-cutting state.

### 11. How do you handle conditional rendering in React?

Either/or: ternary (e.g. spinner vs content). Show or nothing: logical AND (e.g. render an error message only if there is one), being careful that 0 && ... renders 0. Complex logic: early returns at the top of the component. Many variants: a lookup object or a switch in a helper instead of nested ternaries.

### 12. What are PropTypes, and do we need them when using React with TypeScript?

prop-types checks a component's props at runtime and logs a console warning when a prop has the wrong type. We don't need them with TypeScript: TypeScript checks props at compile time, and React 19 ignores propTypes on function components, so PropTypes is legacy. For runtime validation of API data, use Zod.

### 13. Why choose React as a UI library instead of Vanilla JS, Angular, or Vue?

React provides a composable component model, a large ecosystem, strong tooling, a big hiring pool, and flexibility in routing and state choices. Vanilla JS needs more conventions at scale; Angular is a more opinionated full framework; Vue offers a different ergonomic tradeoff. The right choice depends on team and product constraints.

### 14. What are the limitations or downsides of React?

React is a UI library rather than a complete architecture, so teams must choose routing, data fetching, and state patterns. Its ecosystem can create decision fatigue, unnecessary re-renders need understanding, and client rendering alone can affect initial-load and SEO performance without a framework strategy such as Next.js.
