import { glob } from 'glob';
import { readFileSync, statSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import {
  TestFile,
  SourceFile,
  TestGap,
  TestStructureValidation,
  TestIssue,
  DiscoveryConfig,
  DiscoveryResult
} from './types';

export class TestDiscoveryEngine {
  private config: DiscoveryConfig;

  constructor(config?: Partial<DiscoveryConfig>) {
    this.config = {
      testPatterns: [
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/__tests__/**/*.{ts,tsx,js,jsx}',
        '**/tests/**/*.{ts,tsx,js,jsx}'
      ],
      sourcePatterns: [
        'src/**/*.{ts,tsx,js,jsx}',
        'lib/**/*.{ts,tsx,js,jsx}',
        'components/**/*.{ts,tsx,js,jsx}',
        'pages/**/*.{ts,tsx,js,jsx}',
        'api/**/*.{ts,tsx,js,jsx}'
      ],
      excludePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**'
      ],
      frameworks: ['jest', 'vitest', 'cypress', 'playwright'],
      minCoverageThreshold: 80,
      complexityThreshold: 10,
      ...config
    };
  }

  async discover(rootPath: string = process.cwd()): Promise<DiscoveryResult> {
    try {
      const testFiles = await this.discoverTestFiles(rootPath);
      const sourceFiles = await this.discoverSourceFiles(rootPath);
      const testGaps = this.identifyTestGaps(sourceFiles, testFiles);
      const validation = this.validateTestStructure(testFiles);
      const statistics = this.calculateStatistics(testFiles, sourceFiles, testGaps);

      return {
        testFiles,
        sourceFiles,
        testGaps,
        validation,
        statistics
      };
    } catch (error) {
      throw new Error(`Test discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async discoverTestFiles(rootPath: string): Promise<TestFile[]> {
    const testFiles: TestFile[] = [];

    for (const pattern of this.config.testPatterns) {
      const files = await glob(pattern, {
        cwd: rootPath,
        ignore: this.config.excludePatterns,
        absolute: true
      });

      for (const file of files) {
        try {
          const stats = statSync(file);
          const content = readFileSync(file, 'utf-8');
          const relativePath = file.replace(rootPath + '/', '');

          testFiles.push({
            path: relativePath,
            type: this.determineTestType(file, content),
            framework: this.detectFramework(content),
            lastModified: stats.mtime,
            size: stats.size
          });
        } catch (error) {
          console.warn(`Failed to process test file ${file}:`, error);
        }
      }
    }

    return testFiles;
  }

  private async discoverSourceFiles(rootPath: string): Promise<SourceFile[]> {
    const sourceFiles: SourceFile[] = [];

    for (const pattern of this.config.sourcePatterns) {
      const files = await glob(pattern, {
        cwd: rootPath,
        ignore: [...this.config.excludePatterns, ...this.config.testPatterns],
        absolute: true
      });

      for (const file of files) {
        try {
          const stats = statSync(file);
          const content = readFileSync(file, 'utf-8');
          const relativePath = file.replace(rootPath + '/', '');
          const testFiles = this.findRelatedTestFiles(file, rootPath);

          sourceFiles.push({
            path: relativePath,
            type: this.determineSourceType(file, content),
            hasTests: testFiles.length > 0,
            testFiles: testFiles.map(f => f.replace(rootPath + '/', '')),
            complexity: this.calculateComplexity(content),
            lastModified: stats.mtime,
            size: stats.size
          });
        } catch (error) {
          console.warn(`Failed to process source file ${file}:`, error);
        }
      }
    }

    return sourceFiles;
  }

  private determineTestType(filePath: string, content: string): 'unit' | 'integration' | 'e2e' {
    const fileName = basename(filePath).toLowerCase();
    const fileContent = content.toLowerCase();

    if (fileName.includes('e2e') || fileName.includes('integration') || 
        fileContent.includes('cy.') || fileContent.includes('page.goto')) {
      return 'e2e';
    }

    if (fileName.includes('integration') || 
        fileContent.includes('supertest') || 
        fileContent.includes('request(app)')) {
      return 'integration';
    }

    return 'unit';
  }

  private detectFramework(content: string): TestFile['framework'] {
    if (content.includes('describe(') || content.includes('test(') || content.includes('it(')) {
      if (content.includes('vitest') || content.includes('vi.')) {
        return 'vitest';
      }
      if (content.includes('jest')) {
        return 'jest';
      }
    }

    if (content.includes('cy.') || content.includes('cypress')) {
      return 'cypress';
    }

    if (content.includes('page.goto') || content.includes('playwright')) {
      return 'playwright';
    }

    return 'unknown';
  }

  private determineSourceType(filePath: string, content: string): SourceFile['type'] {
    const fileName = basename(filePath).toLowerCase();
    const dirName = dirname(filePath).toLowerCase();

    if (dirName.includes('component') || content.includes('export default function') ||
        content.includes('const Component') || content.includes('React.FC')) {
      return 'component';
    }

    if (dirName.includes('service') || dirName.includes('api') ||
        fileName.includes('service') || fileName.includes('api')) {
      return 'service';
    }

    if (dirName.includes('util') || fileName.includes('util') ||
        dirName.includes('helper') || fileName.includes('helper')) {
      return 'utility';
    }

    if (dirName.includes('api') || fileName.includes('route')) {
      return 'api';
    }

    return 'unknown';
  }

  private findRelatedTestFiles(sourceFile: string, rootPath: string): string[] {
    const baseName = basename(sourceFile, extname(sourceFile));
    const dirName = dirname(sourceFile);
    const testFiles: string[] = [];

    // Common test file patterns
    const testPatterns = [
      `${dirName}/${baseName}.test.*`,
      `${dirName}/${baseName}.spec.*`,
      `${dirName}/__tests__/${baseName}.*`,
      `${dirName}/tests/${baseName}.*`
    ];

    for (const pattern of testPatterns) {
      try {
        const matches = glob.sync(pattern, { cwd: rootPath, absolute: true });
        testFiles.push(...matches);
      } catch (error) {
        // Ignore glob errors
      }
    }

    return testFiles;
  }

  private calculateComplexity(content: string): number {
    let complexity = 1; // Base complexity

    // Count decision points
    const patterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g // Ternary operator
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private identifyTestGaps(sourceFiles: SourceFile[], testFiles: TestFile[]): TestGap[] {
    const gaps: TestGap[] = [];

    for (const sourceFile of sourceFiles) {
      if (!sourceFile.hasTests) {
        const priority = this.calculatePriority(sourceFile);
        const suggestedTestType = this.suggestTestType(sourceFile);

        gaps.push({
          sourceFile: sourceFile.path,
          priority,
          reason: this.generateGapReason(sourceFile),
          suggestedTestType,
          complexity: sourceFile.complexity
        });
      }
    }

    // Sort by priority (high first) and complexity (high first)
    return gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.complexity - a.complexity;
    });
  }

  private calculatePriority(sourceFile: SourceFile): 'high' | 'medium' | 'low' {
    if (sourceFile.complexity >= this.config.complexityThreshold) {
      return 'high';
    }

    if (sourceFile.type === 'service' || sourceFile.type === 'api') {
      return 'high';
    }

    if (sourceFile.type === 'component') {
      return 'medium';
    }

    return 'low';
  }

  private suggestTestType(sourceFile: SourceFile): 'unit' | 'integration' | 'e2e' {
    if (sourceFile.type === 'api' || sourceFile.type === 'service') {
      return 'integration';
    }

    if (sourceFile.type === 'component' && sourceFile.complexity > 5) {
      return 'integration';
    }

    return 'unit';
  }

  private generateGapReason(sourceFile: SourceFile): string {
    const reasons = [];

    if (sourceFile.complexity >= this.config.complexityThreshold) {
      reasons.push(`High complexity (${sourceFile.complexity})`);
    }

    if (sourceFile.type === 'service' || sourceFile.type === 'api') {
      reasons.push('Critical business logic');
    }

    if (sourceFile.size > 1000) {
      reasons.push('Large file size');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Missing test coverage';
  }

  private validateTestStructure(testFiles: TestFile[]): TestStructureValidation {
    const issues: TestIssue[] = [];
    const suggestions: string[] = [];

    for (const testFile of testFiles) {
      // Validate naming conventions
      if (!this.isValidTestFileName(testFile.path)) {
        issues.push({
          type: 'naming',
          severity: 'warning',
          message: 'Test file does not follow naming conventions',
          file: testFile.path
        });
      }

      // Check for framework consistency
      if (testFile.framework === 'unknown') {
        issues.push({
          type: 'structure',
          severity: 'error',
          message: 'Unable to detect test framework',
          file: testFile.path
        });
      }
    }

    // Generate suggestions
    if (testFiles.length === 0) {
      suggestions.push('No test files found. Consider adding tests to your project.');
    }

    const frameworkCounts = testFiles.reduce((acc, file) => {
      acc[file.framework] = (acc[file.framework] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frameworks = Object.keys(frameworkCounts).filter(f => f !== 'unknown');
    if (frameworks.length > 1) {
      suggestions.push('Multiple test frameworks detected. Consider standardizing on one framework.');
    }

    return {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions
    };
  }

  private isValidTestFileName(filePath: string): boolean {
    const fileName = basename(filePath);
    const validPatterns = [
      /\.test\.(ts|tsx|js|jsx)$/,
      /\.spec\.(ts|tsx|js|jsx)$/
    ];

    return validPatterns.some(pattern => pattern.test(fileName)) ||
           filePath.includes('__tests__') ||
           filePath.includes('/tests/');
  }

  private calculateStatistics(testFiles: TestFile[], sourceFiles: SourceFile[], testGaps: TestGap[]) {
    const totalTests = testFiles.length;
    const totalSources = sourceFiles.length;
    const sourcesWithTests = sourceFiles.filter(f => f.hasTests).length;
    const coveragePercentage = totalSources > 0 ? (sourcesWithTests / totalSources) * 100 : 0;

    return {
      totalTests,
      totalSources,
      coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      gapsCount: testGaps.length
    };
  }
}