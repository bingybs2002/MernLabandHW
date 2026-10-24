# Styling

### 1. What are different types of css selectors? (just give the most common ones)

Common selectors are type selectors such as p, class selectors such as .card, ID selectors such as #header, attribute selectors such as input[type=email], descendant/child combinators such as .nav a or .nav &gt; a, pseudo-classes such as :hover, and pseudo-elements such as ::before. I prefer classes for reusable styling and avoid overly specific selectors.

### 2. What is the difference between id and class?

An ID should identify one unique element in a document and has high CSS specificity. A class can be applied to many elements and is better for reusable styling and component state. In modern component code, I use classes almost exclusively for styles.

### 3. What is CSS specificity? Give examples of which elements have higher specificity.

Specificity is the rule CSS uses to choose between competing declarations. Inline styles outrank IDs; IDs outrank classes, attributes, and pseudo-classes; those outrank element selectors. For example, #header (1-0-0) beats .nav .link (0-2-0), which beats div p (0-0-2). If specificity ties, the later rule wins, while !important bypasses the normal cascade and should be avoided.

### 4. Why should you avoid using inline styles or !important?

Inline styles mix presentation into markup, are harder to reuse, cannot use media queries or pseudo-classes, and make theming and responsive states awkward. !important makes the cascade difficult to reason about and encourages specificity battles. I use component classes, design tokens, and intentional selector structure instead.

### 5. What is the CSS box model? Explain content, border, padding, and margin.

Every element has a content box, optional padding around it, a border, and margin outside the border. Content is the actual text or children; padding is space inside the border; border wraps the padding; margin is transparent space separating the element from its neighbors. Width and height normally apply to content, so padding and border add to the rendered size.

### 6. What is box-sizing? What are the differences between border-box and content-box?

box-sizing controls what declared width and height include. content-box is the default: padding and border are added outside the declared size. border-box includes padding and border inside the declared size, which is usually easier for layout, so I commonly set it globally with *, *::before, *::after { box-sizing: border-box; }.

### 7. What are different positions in CSS?

The main values are static, relative, absolute, fixed, and sticky. static follows normal flow; relative stays in flow but becomes an offset reference; absolute is removed from flow and positioned against the nearest positioned ancestor; fixed is tied to the viewport; sticky behaves in flow until a scroll threshold.

- **How do you use static, absolute, fixed, relative, and sticky positioning?**  
  I use static for normal document flow, relative to nudge an item or establish a containing block, and absolute for badges or overlays that should not take space. Fixed works for viewport-level UI such as a persistent support button or modal backdrop, and sticky works for headers or sidebars that should remain visible within their scroll container.

### 8. How do you approach responsive web design?

I start mobile-first, use fluid containers and flexible layout primitives, then add breakpoints when the content—not a device name—needs a layout change. I use semantic structure, responsive typography and media, test real widths and zoom, and make touch targets and keyboard interaction work at every size.

- **What is a media query and what are breakpoints?**  
  A media query applies styles only when conditions such as width, orientation, reduced motion, or color preference match, for example @media (min-width: 768px) { ... }. Breakpoints are the thresholds used for meaningful layout changes, for example when a two-column page can no longer fit. I choose them from the design's content constraints rather than arbitrary device sizes.
- **How do you ensure responsiveness?**  
  I use the viewport meta tag, flexible units (rem, %, vw), max-width containers, Flexbox or Grid, responsive images, and mobile-first media queries. I test narrow and wide viewports with DevTools device mode, browser zoom, long translated text, keyboards, and touch. I also avoid fixed heights and widths unless the component genuinely requires them.

### 9. What is the difference between Flexbox and css grid?

Flexbox is one-dimensional: it excels at arranging items in one row or one column and distributing leftover space. Grid is two-dimensional: it defines rows and columns together, which suits page or component layouts. I often combine them—Grid for the outer layout and Flexbox inside components.

### 10. What is justify-content and align-items in flexbox?

justify-content distributes items along the main axis, which is horizontal by default in flex-direction: row. align-items aligns items along the cross axis, vertical by default for a row. Their axes change when the flex direction changes. A common use is centering: display: flex; justify-content: center; align-items: center.

### 11. What is the difference between rem, px, and em?

px is a CSS pixel, a stable abstract unit rather than necessarily one physical screen pixel. rem is relative to the root (html) font size, so it is excellent for consistent scalable spacing and type that respects user font settings. em is relative to the current element's font size, which is useful locally but can compound when nested.

### 12. What are CSS modules?

CSS Modules scope class names locally at build time, usually by generating unique names. This prevents accidental global collisions while keeping normal CSS syntax. A component imports its module (import styles from './Card.module.css') and uses exported class names (styles.card), which makes ownership clear.

### 13. What are CSS Preprocessors? Give 1-2 examples. Can we directly run them in the browser?

Preprocessors such as Sass (SCSS) and Less add authoring features such as variables, nesting, mixins, and partials. Browsers do not run their source directly; a build step (Vite, webpack, or the sass CLI) compiles it to standard CSS. Native CSS now provides many of the original conveniences, including custom properties and nesting.

### 14. Tell me about the basics of tailwind CSS?

Tailwind is a utility-first CSS framework: components are composed from small classes for spacing, layout, color, breakpoints (md:, lg:), and states (hover:, focus:). Its configuration centralizes design tokens and its build process generates only the classes you use. I use it to move quickly while extracting repeated patterns into components rather than creating unreadable class strings.

### 15. What are Component Libraries like Material UI, Chakra, Ant Design?

They provide prebuilt, accessible UI components such as buttons, modals, tables, and form controls, plus theming and design conventions. I install the library, configure its theme and tokens, and compose its components. They accelerate delivery, but I assess bundle size, accessibility, customization limits, and fit with the product design system.

### 16. What are some of the most common design systems for the UI?

Examples include Google's Material Design, Apple Human Interface Guidelines, IBM Carbon, Microsoft Fluent, Shopify Polaris, Atlassian Design System, and Adobe Spectrum. A design system is more than a component library: it includes tokens, accessibility and content guidance, patterns, documentation, and governance that create a consistent product experience.
