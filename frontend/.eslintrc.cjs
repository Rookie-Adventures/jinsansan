module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'unused-imports',
    'sonarjs',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  rules: {
    'no-unused-vars': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
    ],
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/no-unused-modules': 'error',
    // SonarJS rules
    'sonarjs/cognitive-complexity': 'error',
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/no-duplicate-string': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/no-redundant-jump': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true
      }
    }
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    'build/',
    '*.test.{ts,tsx}',
    '*.spec.{ts,tsx}',
    '*.d.ts',
    'public/'
  ]
} 