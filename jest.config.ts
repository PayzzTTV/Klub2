import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Chemins des tests
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Exclure node_modules, .next, et les arborescences étrangères au projet.
  // `pixel-agents/` est un projet distinct déposé dans le dossier, et
  // `.claude/worktrees/` contient des copies de travail : les deux faisaient
  // échouer la suite et rendaient le signal des tests inexploitable — or la CI
  // bloque désormais le build sur les tests.
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/pixel-agents/',
    '<rootDir>/.claude/',
  ],

  // Coverage
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  // Seuils à réactiver progressivement au fil des tests
  // coverageThreshold: { global: { branches: 50, functions: 50, lines: 50, statements: 50 } },

  // Module aliases (correspond à tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
