/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      include: ['./src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'build'],
      
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/tests/',
          '**/*.d.ts',
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
          '**/types/',
          'src/vite-env.d.ts',
        ],
        thresholds: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },

      // 并发和性能配置
      pool: 'threads',
      poolOptions: {
        threads: {
          minThreads: 1,
          maxThreads: 4
        }
      },
      maxConcurrency: 5,

      // 超时配置
      testTimeout: 10000,
      hookTimeout: 10000,

      // 报告配置
      reporters: ['default', 'html'],
      outputFile: {
        html: './coverage/test-report.html'
      }
    }
  })
); 