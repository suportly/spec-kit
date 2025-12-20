export interface TestConfiguration {
  testPatterns: string[];
  excludePatterns: string[];
  testTimeout: number;
  maxConcurrency: number;
  retryAttempts: number;
  setupFiles: string[];
  teardownFiles: string[];
}

export interface CoverageThresholds {
  global: {
    branches: number;
    functions: number;
    lines: number;
    statements: number;
  };
  perFile?: {
    branches: number;
    functions: number;
    lines: number;
    statements: number;
  };
}

export interface ExclusionPatterns {
  files: string[];
  directories: string[];
  extensions: string[];
  patterns: string[];
}

export interface ProjectConfiguration {
  name: string;
  version: string;
  description?: string;
  testConfiguration: TestConfiguration;
  coverageThresholds: CoverageThresholds;
  exclusionPatterns: ExclusionPatterns;
  environment: string;
  customSettings?: Record<string, any>;
}

export interface ConfigurationSchema {
  projects: Record<string, ProjectConfiguration>;
  global: {
    defaultEnvironment: string;
    supportedEnvironments: string[];
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ConfigurationLoadResult {
  success: boolean;
  configuration?: ConfigurationSchema;
  errors?: ValidationError[];
  warnings?: string[];
}