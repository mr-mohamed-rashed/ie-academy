import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    visualizer({
      filename: 'bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
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
    modulePreload: {
      polyfill: true,
      resolveDependencies(filename, deps) {
        // Prevent preloading charts, database and dashboard modules on initial landing page load
        if (filename.includes('vendor-charts') || filename.includes('vendor-database') || filename.includes('Dashboard') || filename.includes('Login') || filename.includes('StudentAnalyticsModal')) {
          return [];
        }
        return deps;
      }
    },
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@supabase')) return 'vendor-database';
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts';
            return 'vendor-helpers';
          }
        }
      }
    }
  }
})
