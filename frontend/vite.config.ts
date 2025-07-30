import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  /**
   * Vite only uses the `server` field while running in dev (`vite dev`).
   * It is ignored during the build/preview steps, so having this proxy
   * present unconditionally is harmless for production builds.
   */
  const server =
    command === 'serve'
      ? {
          proxy: {
            /**
             * Proxy API requests during development to the local backend.
             * This keeps frontend code free of hard-coded localhost URLs
             * and lets us use relative `/api` paths in source code.
             *
             *   /api/foo  ->  http://localhost:4000/api/foo
             */
            '/api/*': {
              target: 'http://localhost:4000',
              changeOrigin: true,
              secure: false,
              /**
               * Remove the `/api` prefix when forwarding to the backend.
               * Example:  /api/tenants  ->  http://localhost:4000/tenants
               */
              rewrite: (path: string) => path.replace(/^\/api/, ''),
            },
          },
        }
      : undefined

  return {
    plugins: [react()],
    server,
  }
})
