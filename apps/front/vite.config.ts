import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/young': { target: 'http://localhost:3000', changeOrigin: true },
      '/opportunities': { target: 'http://localhost:3000', changeOrigin: true },
      '/demand': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
