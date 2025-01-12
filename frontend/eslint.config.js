import { defineConfig, flatConfig } from 'eslint';

export default defineConfig([
  flatConfig({
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'import'
    ],
    rules: {
      'max-lines-per-function': ['error', { 
        max: 60,
        skipBlankLines: true,
        skipComments: true 
      }],
      'max-params': ['error', 4],
      'no-console': 'warn',
      'no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': ['warn', {
        'groups': [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index']
        ],
        'newlines-between': 'always'
      }]
    },
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    settings: {
      react: {
        version: 'detect'
      }
    }
  })
]); 