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
        manualChunks: (id: string) => {
          if (id.includes('react-dom') || id.includes('node_modules/react/')) return 'react-vendor';
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },

    minify: true,

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
