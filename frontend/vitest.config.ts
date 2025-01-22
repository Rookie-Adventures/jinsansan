/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/types/',
      ],
    },
    include: [
      '**/src/**/*.{test,spec}.{ts,tsx}',
      '**/src/**/__tests__/**/*.{ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.idea',
      '.git',
      '.cache'
    ],
    reporters: ['default'],
    watch: false,
    isolate: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    testTimeout: 5000,
    hookTimeout: 5000,
    teardownTimeout: 5000,
    maxConcurrency: 1,
    sequence: {
      shuffle: false,
      concurrent: false,
      setupFiles: 'list'
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
}) 