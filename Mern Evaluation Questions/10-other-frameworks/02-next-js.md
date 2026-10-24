# Next.js

### 1. What is the benefit of using Next.js over React? And vice versa?

Next.js adds file-based routing, SSR, static generation, server components, image and font optimization, API or route handlers, and production conventions, which helps SEO and initial load. Plain React (for example with Vite) offers more architectural freedom, simpler static hosting, and no server to run, but requires choosing and integrating those capabilities independently; it suits internal dashboards and SPAs behind login.

### 2. What is the difference between page router and app router?

Pages Router uses the pages directory and data-fetching functions such as getServerSideProps and getStaticProps. App Router (Next.js 13+) uses the app directory, nested layouts, Server Components by default, streaming with loading.tsx, and fetch-based caching conventions; teams choose based on project compatibility and migration goals, with App Router the default for new apps.

### 3. What is the difference between client component and server component?

Server Components render on the server and can access server-side resources (databases, secrets) without adding their code to the browser bundle, but cannot use state, effects, or browser APIs. Client Components opt in with 'use client' for interactivity, state, effects, and browser APIs; good boundaries keep most of the tree on the server and minimize client JavaScript.

### 4. What is hydration?

Hydration is when React attaches event handlers and component behavior to HTML that was rendered on the server, making it interactive. The client render must match the server markup, or hydration-mismatch warnings and incorrect UI can result.

### 5. What is Server Side Rendering (SSR)?

Server-Side Rendering generates HTML for each request on the server, then sends it to the browser for hydration. It improves initial content and SEO for dynamic, personalized pages, trading for server latency, caching complexity, and hydration work.

### 6. What are Static Site Generation (SSG) and Incremental Static Regeneration (ISR)?

SSG builds HTML at build/deploy time and serves it from a CDN; it is fast and cheap for content that changes infrequently (blogs, docs, marketing pages), but content becomes stale until the next build. ISR lets a statically generated page be regenerated in the background after a revalidation period (revalidate: 60) or on demand, without rebuilding the whole site, balancing CDN speed with reasonably fresh content.
