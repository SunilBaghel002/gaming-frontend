import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Explicitly define the public directory (optional but recommended for clarity)
  publicDir: 'public',
  // Ensure environment variables are loaded correctly
  envDir: '.', // Default is root directory where .env is located
  envPrefix: 'VITE_', // Default prefix for client-side env variables
  // Configure server for development
  server: {
    port: 5173, // Default Vite port, explicitly set for consistency
    open: true, // Automatically open browser on dev server start
    proxy: {
      // Proxy API requests to backend to avoid CORS issues
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Optimize build for production
  build: {
    outDir: 'dist', // Default output directory
    sourcemap: true, // Enable sourcemaps for debugging
  },
})