# Accessibility

### 1. How do you make your web application more accessible? What guidelines do you follow?

I follow WCAG 2.2 (AA level) principles: perceivable, operable, understandable, and robust. I use semantic HTML, proper headings, labels, keyboard navigation, visible focus states, sufficient color contrast, alt text, accessible forms, correct ARIA when necessary, and logical focus management. I test with keyboard navigation and screen readers as well as automated tools.

### 2. What are aria attributes? Give some examples.

ARIA (Accessible Rich Internet Applications) attributes provide accessibility semantics when native HTML is insufficient. Examples: aria-label, aria-labelledby, aria-describedby, aria-expanded, aria-controls, aria-hidden, and aria-live, plus role. Prefer semantic HTML first; don't use ARIA to replace native elements unnecessarily.

### 3. How do you test accessibility? What tool do you use?

I use axe DevTools and Lighthouse for automated checks (and jest-axe or Playwright with axe in CI), then manually test keyboard navigation, focus behavior, forms, and screen-reader behavior. I also use browser accessibility trees/DevTools and, when appropriate, NVDA or VoiceOver.
