/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true, // Needed for Docker exposure
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom', 'react-router-dom'],
                mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                charts: ['recharts'],
                socket: ['socket.io-client', 'mqtt'],
            },
        },
    },
  }
});
