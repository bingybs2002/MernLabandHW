# Network & Browser

### 1. What is the process between you entering a url in the browser and seeing the content on the browser?

When I enter a URL, the browser parses it, checks caches and resolves the domain through DNS to an IP address. It opens a connection—usually TCP plus TLS for HTTPS—then sends an HTTP request. The server returns HTML and related resources; the browser builds the DOM and CSSOM, creates a render tree, lays out the page, paints pixels, and runs JavaScript as it is loaded. In practice, redirects, caching, HTTP/2 or HTTP/3, and asynchronous resource loading affect the exact sequence.

### 2. What is an IP address?

An IP address is a numerical network address used to route packets to a device or service. IPv4 uses 32 bits, such as 192.0.2.1, while IPv6 uses 128 bits to provide a much larger address space. A domain name is human-friendly; DNS maps it to one or more IP addresses.

### 3. What is the DNS (Domain Name System)?

DNS, or Domain Name System, is the distributed naming system that translates a hostname such as example.com into records such as IP addresses. A resolver checks its cache and, if needed, queries the DNS hierarchy—root, TLD, and authoritative name servers. DNS can also return records for mail, verification, aliases, and service discovery, and its TTL controls how long answers may be cached.

### 4. What is semantic HTML? Why do we need it?

Semantic HTML uses elements for their meaning, not just their appearance—for example, button, nav, main, article, and label instead of generic divs. It gives assistive technology a meaningful structure, improves keyboard behavior and SEO, and makes the code easier to maintain. I use native semantic elements first, then add ARIA only where native HTML cannot express the needed behavior.

### 5. What is a meta tag?

A meta tag supplies metadata about an HTML document and lives in the &lt;head&gt;. Common examples set the character encoding, responsive viewport, page description, robots instructions, and Open Graph preview information. It normally does not render visible page content, but it affects browser behavior, accessibility, search presentation, and link previews.

### 6. What are HTML attributes?

Attributes are name-value settings placed on an element's opening tag to configure its behavior, semantics, or identity. Examples include href on a link, src and alt on an image, disabled on a button, and data-* for custom data. Some are global, such as id, class, lang, and hidden, while others are element-specific.

### 7. What are self-closing (void) elements in HTML? Does &lt;input&gt; need a closing tag?

Void elements cannot contain child content and do not have closing tags. Common examples are &lt;img&gt;, &lt;input&gt;, &lt;br&gt;, &lt;hr&gt;, &lt;meta&gt;, &lt;link&gt;, and &lt;source&gt;. Therefore &lt;input&gt; does not need, and should not have, a closing tag in HTML; in JSX every element must be closed, so it is written self-closing, such as &lt;input /&gt;.

### 8. What is the alt attribute on &lt;img&gt; for?

Alt provides a text alternative for an image. Screen readers announce it when the image conveys information, and it can be shown or used when the image fails to load. I write concise, purpose-based alt text rather than describing every visual detail; decorative images should use an empty alt attribute (alt="") so assistive technology skips them.

### 9. What is HTML injection and how to avoid it?

HTML injection occurs when untrusted input is interpreted as markup, allowing an attacker to alter the page and potentially create an XSS path. I prevent it by treating input as text by default (textContent or framework rendering), using framework escaping, and avoiding unsafe HTML APIs such as innerHTML and dangerouslySetInnerHTML, because they parse a string as HTML. When rendering user-authored rich text is genuinely required, I sanitize it with a well-maintained allowlist sanitizer such as DOMPurify immediately before rendering, and apply CSP as defense in depth.

### 10. How does React JSX automatically sanitize input?

React escapes string values interpolated in JSX, so text such as an HTML tag is rendered as text rather than executed as markup. That is safe by default, but it does not make every data flow safe: dangerous URLs (javascript:), server-side output, third-party widgets, and dangerouslySetInnerHTML still require validation and sanitization. I only use dangerouslySetInnerHTML with trusted or carefully sanitized HTML.

### 11. What is the difference between Local storage, session storage, and cookies?

localStorage persists until code or the user clears it and is shared by same-origin tabs. sessionStorage is scoped to one tab and is usually cleared when that tab closes. Cookies are small values sent automatically with matching HTTP requests and can have expiry, path, domain, Secure, SameSite, and HttpOnly attributes.

- **Ask about the sizes of each**  
  Cookies are small — about 4 KB each — because the browser attaches them to every matching request. localStorage and sessionStorage are much larger, typically about 5–10 MB per origin depending on the browser.
- **What’s unique about cookies?**  
  Cookies are unique because the browser can automatically attach them to matching HTTP requests, and the server can set them with a Set-Cookie header. That makes them useful for sessions, especially with Secure and HttpOnly set so JavaScript cannot read them, but it introduces CSRF risk because requests may carry them automatically. SameSite, CSRF tokens, origin checks, and careful domain/path scoping mitigate that risk.

### 12. What is event bubbling and event capturing?

DOM events travel in three phases: capture from the window down to the target, target handling, then bubble back up through ancestors. Most handlers use bubbling, which enables event delegation: one parent listener can handle many child elements. I use capture (addEventListener(type, fn, { capture: true })) only when I specifically need to intercept an event before target or bubbling handlers, and I avoid stopping propagation unless necessary.

### 13. What is Document Object Model (DOM)? Give some examples of how we select DOM elements using Javascript.

The DOM is the browser's object representation of an HTML document; elements, text, and attributes become nodes JavaScript can inspect or change. I can select nodes with document.getElementById, getElementsByClassName, getElementsByTagName, querySelector, and querySelectorAll. In component frameworks I normally update state and let the framework update the DOM rather than manipulating it directly.

### 14. What is the Intersection Observer API? What is it used for?

Intersection Observer lets code observe when a target element enters, leaves, or reaches a threshold within the viewport or another scroll container. It is more efficient than repeatedly measuring layout during scroll events. I use it for lazy-loading images, infinite scroll sentinels, scroll-triggered animations, ad or analytics visibility, and active navigation sections.
