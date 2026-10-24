# Forms and Inputs

### 1. What is a controlled component?

A controlled form input receives its value or checked state from React state and notifies changes through onChange: &lt;input value={name} onChange={e =&gt; setName(e.target.value)} /&gt;. React becomes the single source of truth, which makes validation, conditional UI, and submission behavior predictable.

- **explain two way data binding**  
  React implements a controlled form loop: state flows down into an input's value, and the input's onChange event calls a setter that updates state. Unlike Angular's implicit two-way binding, both directions are explicit in React code.
- **how it differs to uncontrolled**  
  A controlled input stores its current value in React state. An uncontrolled input lets the DOM hold its value (often with defaultValue) and is read through a ref or FormData on submit; uncontrolled inputs can be simpler for basic forms, while controlled inputs suit live validation and UI synchronization.

### 2. What is a Synthetic Event in React?

A Synthetic Event is React's cross-browser wrapper around a native browser event. It normalizes behavior and exposes the native event when needed (e.nativeEvent); modern React no longer pools events, so asynchronous access is generally safe.

### 3. What's the difference between onClick={handleClick}, onClick={handleClick()}, and onClick={() =&gt; handleClick(id)}?

onClick={handleClick} passes the function for React to call on click. onClick={handleClick()} invokes it during render and passes its return value, usually wrong and can cause infinite re-renders if it sets state. An arrow creates a click-time wrapper to pass arguments, with a small new-function allocation per render.

### 4. How do you perform form input validation?

I combine immediate client validation for usability with server-side validation as the authority. I validate on an appropriate interaction point (blur or submit), display specific accessible messages, prevent submission when invalid, sanitize or validate server inputs, and preserve entered values on recoverable errors. Native HTML attributes (required, type=email, pattern) cover simple cases.

- **what library to use**  
  React Hook Form for form state with minimal re-renders, paired with a schema validator such as Zod (or Yup) through a resolver, so the same schema can validate on the server. Formik is an older alternative.

### 5. What is the default behavior of forms? How do we prevent it?

A browser form submission navigates or reloads the page by default. In a React submit handler I call event.preventDefault(), validate data, and run the intended asynchronous action while retaining accessible native form semantics.

### 6. Explain debounce and throttle and what we might need them in a form?

Debounce delays execution until calls stop for a specified time, resetting the timer on each new call; throttle limits a function to at most once per interval. In forms, I debounce search-as-you-type requests, username availability checks, autosave, and expensive validation so work runs after the user pauses instead of on every keystroke. Throttle fits continuous events such as scroll or resize, or preventing a submit button from firing repeatedly.
