# React Router & Rendering Techniques

### 1. What is React Router?

React Router is the standard routing library for React. It maps URL locations to components without full-page reloads: &lt;BrowserRouter&gt; connects to the browser History API, &lt;Routes&gt; and &lt;Route path="/users/:id" element={&lt;User /&gt;} /&gt; declare routes, &lt;Link&gt; navigates without reloading, useNavigate navigates programmatically, and useParams/useSearchParams read URL data. It supports nested routes with &lt;Outlet&gt;, loaders and actions in data-router setups, and a catch-all * route for 404 pages.

### 2. How is Client Side Routing (CSR) different from both traditional routing & Server Side Rendering (SSR)?

Traditional routing asks the server for a new HTML document on every navigation, causing a full page reload. Client-side routing loads the JavaScript app once, then swaps views in the browser and updates history without a document request, so navigation is fast and state survives; the server must still rewrite unknown paths to index.html. SSR is about rendering, not navigation: the server renders initial HTML for each request, improving first content and crawler visibility, then the client hydrates it for interaction; frameworks like Next.js combine SSR for the first load with client-side navigation afterward.

### 3. Why does Client Side Rendering have slow initial loading and poor SEO, and how could we solve it?

The browser receives a nearly empty HTML shell and must download, parse, and execute JavaScript, often followed by API calls, before meaningful content appears, and some crawlers and link-preview bots may not execute it reliably. Code splitting, asset optimization, pre-rendering/SSG, SSR, streaming, and server components improve initial content and discoverability.

### 4. How do you protect a route from unauthorized users in the frontend using Auth Guards?

I use a route guard component (for example &lt;ProtectedRoute&gt;) that checks authenticated identity and required roles or claims, renders &lt;Navigate to="/login" replace state={{ from: location }} /&gt; or a forbidden state, and otherwise renders the child route or &lt;Outlet /&gt;. This improves UX but is not security: the backend must enforce authorization on every API request.
