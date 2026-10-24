# Microfrontend

### 1. What is the microfrontend concept? What is a Shell App?

Microfrontends split a large frontend into independently developed/deployed applications owned by different teams, similar to microservices on the backend. The Shell App is the host/container application. It provides shared navigation, layout, authentication/context, and loads individual microfrontends.

### 2. What is module federation? Briefly explain how to set it up.

Module Federation lets independently built frontend applications expose and consume modules at runtime without bundling everything into one application. Typically configure a host and remote, give the remote exposed modules, configure the host with remote URLs, and share dependencies such as React as singletons so multiple copies are avoided. Webpack and modern tooling such as Vite/Rspack support federation solutions.

### 3. How do you share data between multiple microfrontends?

Prefer explicit contracts. Options include shared URL state, custom browser events, a shared state library, shared context when applications are tightly coupled, or backend APIs. Keep cross-microfrontend shared state minimal and avoid creating a monolithic global store that defeats the purpose of independent deployments.
