import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, open: false },
  build: {
    rolldownOptions: {
      output: {
        // Separate long-lived chunks: libraries and generated game data change rarely.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'game-data', test: /src[\\/]data[\\/]generated/ },
          ],
        },
      },
    },
    // The generated game data (~800 kB raw, ~140 kB gzip) is one deliberate chunk.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      // The pure calculation engine is test-first; keep it that way (PLAN.md).
      thresholds: {
        'src/lib/calc/**': { lines: 95, branches: 85 },
      },
    },
  },
});
