# Spec Kit - Test Discovery Engine

## Overview

The Test Discovery Engine is a core module of Spec Kit that automatically discovers test files in your codebase, identifies areas without test coverage, and suggests priorities for creating new tests.

## Features

- **Automatic Test Discovery**: Scans your codebase to find existing test files
- **Source File Analysis**: Identifies source files and their corresponding tests
- **Gap Analysis**: Finds source files without test coverage
- **Priority Suggestions**: Recommends which files should be tested first based on complexity and importance
- **Framework Detection**: Supports Jest, Vitest, Cypress, and Playwright
- **Test Structure Validation**: Validates test file naming conventions and structure
- **Complexity Analysis**: Calculates cyclomatic complexity to prioritize testing efforts

## Usage

```typescript
import { TestDiscoveryEngine } from '@/core/test-discovery';

// Initialize the engine
const engine = new TestDiscoveryEngine({
  testPatterns: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  sourcePatterns: ['src/**/*.{ts,tsx}'],
  minCoverageThreshold: 80,
  complexityThreshold: 10
});

// Discover tests and analyze coverage
const result = await engine.discover('./my-project');

console.log('Test Files:', result.testFiles.length);
console.log('Source Files:', result.sourceFiles.length);
console.log('Coverage:', result.statistics.coveragePercentage + '%');
console.log('Test Gaps:', result.testGaps.length);

// Get high-priority files that need tests
const highPriorityGaps = result.testGaps.filter(gap => gap.priority === 'high');
console.log('High Priority Test Gaps:', highPriorityGaps);
```

## Configuration

The engine accepts the following configuration options:

- `testPatterns`: Glob patterns to find test files
- `sourcePatterns`: Glob patterns to find source files
- `excludePatterns`: Patterns to exclude from discovery
- `frameworks`: Supported test frameworks
- `minCoverageThreshold`: Minimum coverage percentage threshold
- `complexityThreshold`: Complexity threshold for high-priority classification

## Output

The discovery result includes:

- `testFiles`: Array of discovered test files with metadata
- `sourceFiles`: Array of source files with test status
- `testGaps`: Files without tests, sorted by priority
- `validation`: Test structure validation results
- `statistics`: Overall coverage and gap statistics

## Test Gap Prioritization

Files are prioritized for testing based on:

1. **High Priority**: Complex files (>10 complexity), services, and API endpoints
2. **Medium Priority**: Components and moderately complex files
3. **Low Priority**: Utility functions and simple files

## Framework Support

The engine automatically detects:

- **Jest**: `describe()`, `test()`, `it()` with Jest-specific imports
- **Vitest**: Similar to Jest but with Vitest-specific imports
- **Cypress**: `cy.` commands and Cypress-specific syntax
- **Playwright**: `page.goto()` and Playwright-specific APIs

## Development

### Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Building

```bash
npm run build
```

## Contributing

When contributing to the Test Discovery Engine:

1. Add tests for new features
2. Update type definitions
3. Follow existing code patterns
4. Update documentation

## License

MIT License - see LICENSE file for details.