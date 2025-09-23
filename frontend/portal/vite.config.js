import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js': 'hoist-non-react-statics',
    },
  },
  optimizeDeps: {
    include: ['hoist-non-react-statics'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/public': 'http://localhost:4000',
      '/security': {
        target: 'http://localhost:4000',
        rewrite: (path) => path.replace(/^\/security/, '/api/security')
      },
      '/files': 'http://localhost:4000'
    }
  }
});
