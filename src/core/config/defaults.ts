import { TestConfiguration, CoverageThresholds, ExclusionPatterns, ConfigurationSchema } from './types';

export const DEFAULT_TEST_CONFIGURATION: TestConfiguration = {
  testPatterns: [
    '**/*.test.{js,ts,jsx,tsx}',
    '**/*.spec.{js,ts,jsx,tsx}',
    '**/tests/**/*.{js,ts,jsx,tsx}'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**'
  ],
  testTimeout: 30000,
  maxConcurrency: 4,
  retryAttempts: 2,
  setupFiles: [],
  teardownFiles: []
};

export const DEFAULT_COVERAGE_THRESHOLDS: CoverageThresholds = {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  perFile: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
};

export const DEFAULT_EXCLUSION_PATTERNS: ExclusionPatterns = {
  files: [
    '*.config.js',
    '*.config.ts',
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js'
  ],
  directories: [
    'node_modules',
    '.next',
    'dist',
    'build',
    'coverage',
    '.git'
  ],
  extensions: [
    '.d.ts',
    '.stories.ts',
    '.stories.tsx'
  ],
  patterns: [
    '**/*.mock.*',
    '**/__mocks__/**',
    '**/fixtures/**'
  ]
};

export const DEFAULT_CONFIGURATION: ConfigurationSchema = {
  projects: {},
  global: {
    defaultEnvironment: 'development',
    supportedEnvironments: ['development', 'staging', 'production', 'test'],
    logLevel: 'info'
  }
};