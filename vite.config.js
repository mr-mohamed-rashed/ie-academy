import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      exclude: ['**/*.svg'],
      webp: {
        quality: 75,
      },
      avif: {
        quality: 65,
      },
      png: {
        quality: 75,
      },
      jpeg: {
        quality: 75,
      }
    })
  ],
  base: '/',
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@supabase')) return 'vendor-database';
            return 'vendor-helpers';
          }
        }
      }
    }
  }
})
