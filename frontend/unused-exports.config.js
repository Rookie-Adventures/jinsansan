export default {
  entryPoints: ['src/main.tsx', 'src/App.tsx'],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludePatterns: [
    '**/node_modules/**',
    '**/__tests__/**',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/types/**'
  ],
  aliases: {
    '@': 'src'
  }
} 