import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The React app runs on :5173 and forwards /api calls to the Express server on :3001.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3001" } },
});
