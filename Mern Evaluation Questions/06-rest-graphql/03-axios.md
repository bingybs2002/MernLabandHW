# Axios

### 1. How is Axios different from fetch api?

fetch is a built-in web API that resolves even for HTTP error status codes and requires explicit response parsing (res.json()). Axios is a library with automatic JSON parsing and serialization, request/response interceptors, timeout conveniences, upload progress, and it rejects non-2xx responses by default.

### 2. What is an Axios Interceptor?

An interceptor runs before a request is sent or before a response reaches application code. I use request interceptors for auth headers and tracing, and response interceptors for normalized errors or controlled token refresh on 401, avoiding loops and global hidden behavior.
