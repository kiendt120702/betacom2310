import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: mode === "production" ? "terser" : false,
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
    cssTarget: 'chrome80',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React chunks
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          
          // UI library chunks - more granular
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Third-party chunks
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          
          // Large page chunks
          if (id.includes('FastDeliveryCalculationPage') || id.includes('FastDelivery')) {
            return 'fast-delivery';
          }
          if (id.includes('Gpt4oMiniPage') || id.includes('gpt4o')) {
            return 'gpt4o';
          }
          if (id.includes('AdminPanel') || id.includes('admin')) {
            return 'admin';
          }
          
          // Dashboard chunks
          if (id.includes('SalesDashboard') || id.includes('dashboard')) {
            return 'dashboard';
          }
          
          // Utility chunks
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils';
          }
          
          // Node modules default
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    ...(mode === "production" && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
          reduce_vars: true,
          dead_code: true,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
    }),
  },
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'date-fns',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  esbuild: {
    target: 'es2015',
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));