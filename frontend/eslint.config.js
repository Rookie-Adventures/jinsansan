import eslint from '@eslint/js';
import * as tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig([
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: ['./tsconfig.json', './tsconfig.eslint.json'],
        tsconfigRootDir: '.'
      },
      globals: {
        // 浏览器环境全局变量
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        performance: 'readonly',
        // 计时器
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // Node.js 环境全局变量
        process: 'readonly',
        global: 'readonly',
        // React 全局变量
        React: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      'import': 'eslint-plugin-import',
      'unused-imports': 'eslint-plugin-unused-imports',
      'sonarjs': 'eslint-plugin-sonarjs'
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true,
        'args': 'none'
      }],
      'no-console': isDevelopment ? 'off' : 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': isDevelopment ? 'warn' : 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unreachable': 'error',
      'no-global-assign': 'error',
      // 检测重复代码
      'sonarjs/no-duplicate-string': ['error', 5],
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-identical-functions': 'error',
      
      // 检测未使用的导入
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      
      // 导入顺序规范
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc'
          }
        }
      ]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        it: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off'
    }
  }
]);
