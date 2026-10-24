# Performance

### 1. What are the core web vitals? Explain each

Core Web Vitals are Google's user-experience metrics, measured at the 75th percentile of real page loads: LCP for loading, INP for responsiveness, and CLS for visual stability. Good targets: LCP &lt;= 2.5s, INP &lt;= 200ms, CLS &lt;= 0.1.

- **LCP**  
  Largest Contentful Paint measures how long it takes for the largest visible content element—such as a hero image, heading, or large text block—to render. Good: &lt;= 2.5s. Needs improvement: 2.5-4.0s. Poor: &gt; 4.0s. Improve it with fast server response, preloading the hero image, and removing render-blocking resources.
- **INP**  
  Interaction to Next Paint measures how responsive a page is to user interactions such as clicks, taps, and keyboard input, reporting close to the slowest interaction during the visit. Good: &lt;= 200ms. Needs improvement: 200-500ms. Poor: &gt; 500ms. Improve it by breaking up long tasks, reducing JavaScript, and avoiding expensive re-renders.
- **CLS**  
  Cumulative Layout Shift measures unexpected visual movement of page content during loading. Target &lt;= 0.1. Avoid it by reserving image/video dimensions, avoiding inserting content above existing content, using stable placeholders, reserving ad/iframe space, and loading fonts carefully.
- **how to monitor it?**  
  Lab: Chrome DevTools Performance panel and Lighthouse. Lab plus field: PageSpeed Insights. Field data: the Chrome UX Report (CrUX) and Google Search Console. In production: the web-vitals library sending metrics to analytics, or RUM/observability platforms such as Sentry, New Relic, or Datadog.

### 2. How do you improve the initial loading speed of your web page? Give as many methods as possible.

Reduce JavaScript and CSS; code-split and lazy-load noncritical code; minify/compress assets (gzip/Brotli); tree-shake unused code; optimize images and use modern formats; preload critical assets; use font-display and limit fonts; defer noncritical scripts; use a CDN; enable browser/server caching; use HTTP/2 or HTTP/3; reduce redirects; optimize API/database latency; SSR/SSG when appropriate; stream content when useful; remove unnecessary third-party scripts; and prioritize above-the-fold content.

### 3. How do you handle displaying a very massive amount of data (like 100,000) on the UI without freezing the browser?

Do not render all 100,000 DOM nodes at once. Prefer server-side pagination/filtering/sorting and virtualization so only visible rows are rendered. Debounce expensive search/filter operations, memoize expensive calculations, batch updates, and move CPU-heavy processing to a Web Worker when appropriate.

- **Explain virtualization and library to use for that**  
  Virtualization (windowing) renders only the rows currently visible in the viewport plus a small buffer, inside a container sized for the full list, instead of rendering the entire dataset. As the user scrolls, items are mounted/unmounted or reused, so the DOM stays small. Common React libraries include TanStack Virtual, react-window, and react-virtuoso.

### 4. What is infinite scrolling, why do you need it and how do you implement it?

Infinite scrolling loads the next batch of data as the user approaches the bottom, avoiding one huge initial request and reducing the amount of DOM content shown at once. Implement it with paginated/cursor APIs plus an IntersectionObserver watching a sentinel element. When it becomes visible, fetch the next page and append it (useInfiniteQuery in React Query handles the paging state). Combine with virtualization for very large lists.

### 5. What is an AutoComplete component? How can you improve its performance?

An AutoComplete lets users type and receive matching suggestions. For performance, debounce API requests, cancel stale requests with AbortController, limit the number of results, cache repeated queries, use server-side search, avoid filtering huge datasets on the main thread, virtualize very long suggestion lists, and avoid unnecessary React re-renders.

### 6. Explain offset based vs cursor based pagination?

Offset pagination uses a page number or offset plus a limit, for example ?offset=100&limit=20: the database skips the first 100 rows and returns the next 20. It is simple and supports jumping to any page, but large offsets get slower and inserts/deletes can cause records to shift or repeat between pages. Cursor pagination uses a value representing the position of the last item, such as an ID or timestamp: ?after=abc123&limit=20. It is more efficient and stable for large or frequently changing datasets (feeds, infinite scroll) because the database continues from an indexed cursor instead of skipping rows, but you cannot jump directly to page 50.

### 7. Explain the ways to improve performance for image loading?

Resize images to their displayed dimensions; use modern formats such as WebP/AVIF; compress images; lazy-load below-the-fold images (loading="lazy"); preload or use fetchpriority="high" only for critical hero images; provide width/height or aspect-ratio to prevent CLS; use a CDN/image optimization service; cache aggressively; and avoid oversized images.

- **What are responsive images?**  
  Responsive images let the browser choose an appropriate image size for the device and viewport. Common techniques are srcset with sizes for different resolutions and the &lt;picture&gt; element for different formats or art direction.
- **how CDN helps?**  
  A CDN caches images at edge locations close to users, reducing network latency and load on the origin server. Image CDNs can also resize, compress, convert formats, and optimize quality based on the request.
- **prefetch and preload?**  
  Preload (&lt;link rel="preload"&gt;) tells the browser an asset is important for the current page and should be fetched early, such as a critical font or hero image. Prefetch (&lt;link rel="prefetch"&gt;) indicates an asset is likely needed for a future navigation and is fetched at low priority when the browser is idle.

### 8. What is lazy loading? And what is dynamic import in React?

Lazy loading delays loading a resource until it is needed. A dynamic import, import('./Dashboard'), returns a promise and tells the bundler to split that module into a separate chunk. In React, const Dashboard = React.lazy(() =&gt; import('./Dashboard')) downloads the component only when it first renders.

- **What is the Suspense component?**  
  React Suspense lets a component display fallback UI while something it depends on is not ready. A common use is showing a loading state while a lazy-loaded component downloads: &lt;Suspense fallback={&lt;Spinner /&gt;}&gt;&lt;Dashboard /&gt;&lt;/Suspense&gt;. It also works with Suspense-enabled data fetching and the use API.

### 9. What are web worker and service worker?

A Web Worker runs JavaScript in a separate background thread instead of the main UI thread, so CPU-heavy work such as large data processing, parsing, or calculations keeps the UI responsive; it communicates through postMessage and has no DOM access. A Service Worker is a background script tied to an origin that acts as a network proxy: it can intercept requests, manage caching, enable offline experiences (PWAs), and support push notifications. In short, a web worker is for computation, a service worker is for network and offline control, and they have different lifecycles.
