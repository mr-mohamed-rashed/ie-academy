import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { visualizer } from 'rollup-plugin-visualizer'

function inlineCssPlugin() {
  return {
    name: 'inline-css-plugin',
    enforce: 'post',
    generateBundle(_, bundle) {
      const cssAssets = Object.keys(bundle).filter(fileName => fileName.endsWith('.css'));
      let combinedCss = '';
      for (const fileName of cssAssets) {
        const asset = bundle[fileName];
        if (asset && asset.source) {
          combinedCss += asset.source.toString() + '\n';
          delete bundle[fileName];
        }
      }

      const htmlFile = bundle['index.html'];
      if (htmlFile && htmlFile.source && combinedCss) {
        let html = htmlFile.source.toString();
        // Remove only local bundled stylesheet link tags (keep Google Fonts)
        html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, (match) => {
          if (match.includes('fonts.googleapis.com')) return match;
          return '';
        });
        // Inject inlined style block directly in <head>
        html = html.replace('</head>', `<style id="inlined-critical-css">${combinedCss.trim()}</style></head>`);
        htmlFile.source = html;
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    inlineCssPlugin(),
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
    sourcemap: false,
    cssCodeSplit: false
  }
})
