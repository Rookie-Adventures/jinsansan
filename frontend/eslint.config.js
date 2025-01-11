import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import imports from 'eslint-plugin-import';

export default [{
  files: ['**/*.{js,jsx,ts,tsx}'],
  ignores: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: typescriptParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  },
  plugins: {
    '@typescript-eslint': typescript,
    'react': react,
    'react-hooks': reactHooks,
    'prettier': prettier,
    'import': imports
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import rules
    'import/order': ['warn', {
      'groups': [
        ['builtin', 'external'],
        ['internal'],
        ['parent', 'sibling', 'index']
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'complexity': ['error', 10],
    'max-depth': ['error', 4],
    'max-lines-per-function': ['error', { 
      max: 50,
      skipBlankLines: true,
      skipComments: true 
    }],
    'max-params': ['error', 4]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}]; 