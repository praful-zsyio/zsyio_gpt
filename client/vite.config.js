import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          process.nextTick(() => {
            proxy.removeAllListeners('error');
            proxy.on('error', (err, _req, res) => {
              // Suppress unhandled ECONNREFUSED terminal output and return 503 response
              if (res && !res.headersSent && typeof res.writeHead === 'function') {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  message: 'Backend server is offline or starting up on port 5000.',
                }));
              }
            });
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          process.nextTick(() => {
            proxy.removeAllListeners('error');
            proxy.on('error', (_err, _req, res) => {
              if (res && !res.headersSent && typeof res.writeHead === 'function') {
                res.writeHead(404);
                res.end();
              }
            });
          });
        },
      }
    }
  }
});
