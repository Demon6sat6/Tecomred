import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Warn if any chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Split vendor libs into separate cacheable chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router':       ['react-router-dom'],
          'icons':        ['lucide-react'],
        },
      },
    },

    // Enable minification (default esbuild, fastest)
    minify: 'esbuild',

    // Generate source maps for production error tracking
    sourcemap: false,

    // Target modern browsers (drops IE polyfills)
    target: 'es2020',
  },

  preview: {
    port: 4173,
    strictPort: true,
  },
})
