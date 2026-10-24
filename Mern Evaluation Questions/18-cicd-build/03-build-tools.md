# Build Tools

### 1. What is a bundler (e.g., Webpack), and what does bundling mean? Why do we need bundling?

A bundler analyzes an application's module dependency graph from an entry point and packages JavaScript, CSS, and other assets into a few optimized, browser-ready files. We need bundling to reduce the number of network requests, resolve npm package imports the browser can't load directly, transform code (TypeScript, JSX, modern syntax) for browser compatibility, and optimize output with minification, tree shaking, code splitting, and content-hashed filenames for caching.

### 2. What are the differences between Webpack and Vite?

Webpack is a mature, highly configurable bundler that bundles the whole app in both development and production, so dev-server startup and updates slow down as projects grow; it has a huge loader/plugin ecosystem and deep customization. Vite serves native ES modules to the browser in development, transforming files on demand, so startup and HMR are very fast regardless of app size; since Vite 8 (March 2026) it uses the Rust-based Rolldown bundler in place of esbuild + Rollup for production builds. Vite has simpler config and is the default for modern React projects; Webpack remains common in older and highly customized apps.

### 3. Explain some of the build tool's feature and what it does

Build tools do more than combine files: they remove unused code, split output into chunks, and give a fast development loop.

- **tree shaking**  
  Tree shaking removes unused exports from the final production bundle by statically analyzing ES module import/export statements. It reduces JavaScript bundle size, which improves download, parse, and execution performance; it works best with ES modules and side-effect-free packages.
- **code splitting**  
  Code splitting divides the application into multiple JavaScript chunks instead of one large bundle, for example per route or for a heavy library, via dynamic import() or React.lazy. Combined with lazy loading, chunks download only when needed, reducing the initial payload and speeding up initial loading.
- **Hot Module Replacement (HMR)**  
  HMR updates changed modules in the running browser app during development without a full page reload, preserving application state when possible (React Fast Refresh keeps component state), so edits appear almost instantly.
- **dev server**  
  A local development server that serves the application, transforms modules (TypeScript, JSX, CSS) on the fly, handles HMR, and often provides fast refresh, API proxying to avoid CORS, an error overlay, and HTTPS options. Vite's dev server runs with npm run dev.
