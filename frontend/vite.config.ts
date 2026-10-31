import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Dev-only: the app uses relative /api and /ws paths (same-origin in prod).
    // Forward them to the backend so local dev doesn't hit the Vite server itself.
    // The `origin` override presents the backend's allowed origin regardless of
    // which port Vite actually binds to, so its CORS check passes in dev.
    proxy: {
      '/api': {
        target: 'http://localhost:8199',
        changeOrigin: true,
        headers: { origin: 'http://localhost:5173' },
      },
      '/ws': {
        target: 'http://localhost:8199',
        ws: true,
        changeOrigin: true,
        headers: { origin: 'http://localhost:5173' },
      },
    },
  },
})
