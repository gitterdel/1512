import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    cors: true,
    hmr: {
      clientPort: 443
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true
  }
});