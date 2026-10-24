# Real-time Communication

### 1. What's wrong with short polling?

Short polling repeatedly sends requests on a timer whether or not data changed, wasting bandwidth and server work while still adding update delay. It scales poorly for many clients and can overload systems during quiet periods.

### 2. How is long polling different from short polling?

With long polling, the server holds a request open until data updates or a timeout expires, then the client reconnects. It reduces empty responses compared with short polling but still has reconnect overhead and is less capable than persistent channels.

### 3. What is a WebSocket?

A WebSocket is a persistent, full-duplex connection established through an HTTP upgrade handshake. Both client and server can send messages at any time, making it suitable for chat, collaboration, games, and live dashboards.

### 4. What are Server-Sent Events (SSE)?

SSE is a one-way server-to-browser streaming protocol over HTTP, consumed with EventSource. It supports automatic reconnection and event IDs, making it simple for notifications or live feeds where clients do not need to send real-time messages back.

### 5. When would you choose SSE over a WebSocket?

SSE is one-way (server to client) over plain HTTP and reconnects automatically: use it when only the server pushes (notifications, live feeds, streamed AI responses). WebSocket is two-way (full-duplex): use it when the client also sends real-time messages (chat, games, collaborative editing).

### 6. What is Socket.IO, and how does it relate to WebSocket?

Socket.IO is a higher-level real-time library with events, rooms, acknowledgements, reconnection, and fallback transports. It often uses WebSocket but is not the WebSocket protocol itself, so a raw WebSocket client cannot directly speak Socket.IO.
