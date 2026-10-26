import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Ambil URL target backend dari .env.local / environment
  // Contoh: VITE_BACKEND_URL=https://my-app.up.railway.app
  // Atau VITE_API_BASE_URL=https://my-app.up.railway.app/api
  const rawTarget = env.VITE_BACKEND_URL || env.VITE_API_TARGET || env.VITE_API_BASE_URL || 'http://localhost:80';
  const backendHost = rawTarget.replace(/\/api\/?$/, '');
  const isLocalXampp = backendHost.includes('localhost:80') || backendHost.includes('127.0.0.1:80');

  return {
    plugins: [
      react({
        // Use SWC-based transform for faster HMR and builds
        // (already default in @vitejs/plugin-react v4+)
      }),
      tailwindcss(),
    ],

    // Jika user mendefinisikan VITE_API_BASE_URL di .env.local, gunakan itu.
    // Jika tidak, defaultkan ke '/api' agar melalui proxy Vite.
    define: env.VITE_API_BASE_URL ? {} : {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api'),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: backendHost,
          changeOrigin: true,
          secure: false,
          timeout: 300000,
          proxyTimeout: 300000,
          rewrite: (path) => isLocalXampp ? path.replace(/^\/api/, '/GAS Website/api') : path,
        },
        '/uploads': {
          target: backendHost,
          changeOrigin: true,
          secure: false,
          timeout: 300000,
          proxyTimeout: 300000,
          rewrite: (path) => isLocalXampp ? path.replace(/^\/uploads/, '/GAS Website/uploads') : path,
        },
      },
    },

    build: {
      // Target modern browsers — smaller output, native ESM
      target: 'es2020',

      // Terser minification — strips console.log, dead code
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2,          // Second pass finds more dead code
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: true,
        format: {
          comments: false,    // Strip all comments from output
        },
      },

      rollupOptions: {
        output: {
          // Manual chunk splitting — separates rarely-changing vendor code
          // from frequently-changing app code. Improves cache hit rates.
          manualChunks: (id) => {
            // React core — smallest, most stable, cached longest
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Lucide icons — large bundle, changes rarely
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
            // Any other node_modules go into a general vendor chunk
            if (id.includes('node_modules/')) {
              return 'vendor-misc';
            }
          },
          // Consistent filenames for better long-term caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },

      // Warn on large chunks (helps catch accidental large imports)
      chunkSizeWarningLimit: 400,

      // Generate source maps only in development (not in production builds)
      sourcemap: false,
    },

    // Pre-bundle heavy dependencies for fast dev server startup
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      // Exclude packages that work better as ESM
      exclude: [],
    },
  };
});
