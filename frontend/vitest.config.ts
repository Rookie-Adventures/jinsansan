/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: process.env.TEST_ENV === 'node' ? 'node' : 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['**/src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist'],
      
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.test.{ts,tsx}',
          '**/types/'
        ]
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
      testTimeout: 30000,
      hookTimeout: 10000,

      // 报告配置
      reporters: ['default'],
      outputFile: './coverage/test-report.json'
    }
  })
); 