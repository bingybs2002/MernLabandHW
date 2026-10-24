# Cross Browser Compatibility

### 1. How to make sure your app is cross browser compatible?

Define supported browsers in a Browserslist config in package.json, which drives Autoprefixer and transpilation, and set Vite's build.target to match. Check feature support on Can I Use or MDN, use feature detection and polyfills where needed, and run Playwright E2E tests on Chromium, Firefox, and WebKit (Safari), which cover most users.

### 2. How do you test your app’s cross browser compatibility?

Test the supported browser/OS matrix using real browsers or services such as BrowserStack/Sauce Labs. Automate critical flows with Playwright or Cypress where appropriate, and manually verify areas prone to browser differences such as CSS, forms, media, file APIs, and accessibility.

### 3. What is a Polyfill?

A polyfill is JavaScript code that adds support for a newer web API or feature in environments that do not natively support it. For example, a polyfill can provide Array.prototype.at or fetch for an older browser; core-js is a common source.
