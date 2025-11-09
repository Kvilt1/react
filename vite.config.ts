import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import fs from 'fs';

// Custom plugin to serve available dates
function availableDatesPlugin() {
  return {
    name: 'available-dates',
    configureServer(server) {
      server.middlewares.use('/api/available-dates', (req, res) => {
        const daysDir = path.join(__dirname, 'public', 'days');

        try {
          // Read the days directory
          const dates = fs.readdirSync(daysDir)
            .filter(name => {
              // Check if it's a directory and matches date format YYYY-MM-DD
              const fullPath = path.join(daysDir, name);
              return fs.statSync(fullPath).isDirectory() &&
                     /^\d{4}-\d{2}-\d{2}$/.test(name);
            })
            .sort(); // Sort dates chronologically

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ dates }));
        } catch (error) {
          console.error('Error reading days directory:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to read available dates', dates: [] }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), svgr(), availableDatesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
  },
});
