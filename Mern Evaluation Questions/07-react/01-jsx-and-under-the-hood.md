# JSX and Under the Hood

### 1. What is JSX?

JSX is a JavaScript syntax extension for describing UI with HTML-like markup. It is compiled to React element creation calls, so expressions can be embedded with braces and React can build a declarative UI tree.

- **why is it a syntax sugar?**  
  JSX adds no new runtime capability: everything it does can be written with plain function calls. It only makes the element tree easier to read and write than nested React.createElement calls, and browsers never see JSX itself.
- **how is it compiled by Babel into React.createElement?**  
  Babel (or SWC/esbuild) transforms each tag into a function call with type, props, and children: &lt;button className="btn"&gt;Save&lt;/button&gt; becomes React.createElement('button', { className: 'btn' }, 'Save'). Since React 17's new JSX transform, the compiler emits jsx() from react/jsx-runtime instead, which is why you no longer need to import React in every file. Lowercase tags become strings; capitalized tags become component references.

### 2. Explain React rerendering / reconciliation process

When state or props change, React calls the affected components again to produce a new element tree (render phase), compares it with the previous tree (reconciliation), then applies only the necessary changes to the real DOM (commit phase). Element type and stable keys guide which components and DOM nodes are preserved, updated, mounted, or removed.

- **Virtual DOM**  
  The virtual DOM is the lightweight JavaScript object tree of React elements that describes what the UI should look like. Creating and comparing these objects is cheaper than touching the real DOM, so React works on this tree first and batches real DOM writes.
- **diffing algorithm**  
  React uses heuristics to diff in roughly O(n) instead of a full tree comparison: if two elements have a different type (div vs span, or ComponentA vs ComponentB), React tears down the old subtree and builds a new one; if the type is the same, it keeps the DOM node or component instance and only updates changed props; for lists, it matches children by key.
- **how does it decide what updates to make to the real DOM?**  
  For each node it compares type, key, and props between the old and new trees. Same type and key: update only changed attributes, styles, or text. Different type or key: unmount and mount fresh. The resulting list of mutations is applied in the commit phase, then effects run.

### 3. Briefly explain React Fiber.

Fiber is React's internal reconciliation architecture (since React 16) that represents work in units and allows rendering to be prioritized, paused, or resumed. It supports responsive concurrent features such as transitions and Suspense by separating interruptible rendering work from the synchronous commit of DOM changes.
