import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api/decks': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/api/cards': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
