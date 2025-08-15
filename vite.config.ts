
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
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
    minify: mode === "production" ? "terser" : false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          
          // UI library chunks
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-toast", "@radix-ui/react-select", "@radix-ui/react-tabs"],
          
          // Third-party chunks
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
          icons: ["lucide-react"],
          
          // Utility chunks
          utils: ["clsx", "tailwind-merge", "class-variance-authority"],
        },
      },
    },
    ...(mode === "production" && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
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
      'lucide-react'
    ]
  },
}));
