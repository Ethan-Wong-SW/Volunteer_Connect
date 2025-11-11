import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ADD THIS 'server' BLOCK
  server: {
    proxy: {
      // Any request starting with /api...
      '/api': {
        // ...will be sent to your Python server
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})

