# Comprehensive

### 1. How do you improve the performance of your React app?

I start by measuring the bottleneck rather than optimizing blindly. Then I use code splitting/lazy loading, memoization such as React.memo/useMemo/useCallback when it actually prevents expensive work, virtualization for large lists, pagination/infinite scrolling, debouncing/throttling, efficient data structures, caching, and optimized network/image loading. For expensive CPU work, I can use Web Workers. React transitions can keep non-urgent UI updates responsive. I also profile with React DevTools and browser performance tools.
