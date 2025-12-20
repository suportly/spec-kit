export interface TestFile {
  path: string;
  type: 'unit' | 'integration' | 'e2e';
  framework: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'unknown';
  coverage?: number;
  lastModified: Date;
  size: number;
}

export interface SourceFile {
  path: string;
  type: 'component' | 'service' | 'utility' | 'api' | 'unknown';
  hasTests: boolean;
  testFiles: string[];
  complexity: number;
  lastModified: Date;
  size: number;
}

export interface TestGap {
  sourceFile: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedTestType: 'unit' | 'integration' | 'e2e';
  complexity: number;
}

export interface TestStructureValidation {
  isValid: boolean;
  issues: TestIssue[];
  suggestions: string[];
}

export interface TestIssue {
  type: 'naming' | 'structure' | 'coverage' | 'organization';
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line?: number;
}

export interface DiscoveryConfig {
  testPatterns: string[];
  sourcePatterns: string[];
  excludePatterns: string[];
  frameworks: string[];
  minCoverageThreshold: number;
  complexityThreshold: number;
}

export interface DiscoveryResult {
  testFiles: TestFile[];
  sourceFiles: SourceFile[];
  testGaps: TestGap[];
  validation: TestStructureValidation;
  statistics: {
    totalTests: number;
    totalSources: number;
    coveragePercentage: number;
    gapsCount: number;
  };
}