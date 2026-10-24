# Data Fetching

### 1. How do you cancel an API request that has been sent out?

I pass an AbortSignal to fetch or an Axios-supported signal, then call abort when the request is no longer relevant, such as component unmount or a replaced search. I handle AbortError separately so cancellation is not reported as a product failure.

### 2. What is an AbortController?

AbortController creates an AbortSignal that can cancel compatible asynchronous operations, especially fetch: const controller = new AbortController(); fetch(url, { signal: controller.signal }); controller.abort(). One controller can coordinate several requests, and consumers should check or handle the aborted state cleanly.

### 3. What does fetch's promise resolve to, and what does res.json() do? Does fetch reject on a 404 or 500?

fetch resolves to a Response once HTTP headers arrive, even for 404 or 500; it only rejects on network failure or abort, so code must check response.ok or status. response.json() asynchronously reads and parses the body, and it can reject for invalid JSON or a body-read failure.

### 4. What HTTP method does fetch default to, and how do you send a POST with a JSON body?

fetch defaults to GET. For JSON POST, I provide method: 'POST', a Content-Type: application/json header, and body: JSON.stringify(data), then check the response before parsing it.
