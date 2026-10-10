import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // In dev mode ('serve'), base is '/' so http://localhost:5173/ loads properly.
  // In production build ('build'), base is '/static/' so Django serves staticfiles.
  base: command === 'build' ? '/static/' : '/',
  build: {
    // Output directly into Django's staticfiles directory
    outDir: `${import.meta.dirname}/../staticfiles`,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Predictable asset file names
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to Django during dev
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
}))

