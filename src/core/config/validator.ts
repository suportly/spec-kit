import { ConfigurationSchema, ProjectConfiguration, ValidationError } from './types';

export class ConfigurationValidator {
  private errors: ValidationError[] = [];
  private warnings: string[] = [];

  /**
   * Validates the complete configuration schema
   */
  validate(config: any): { isValid: boolean; errors: ValidationError[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    if (!config || typeof config !== 'object') {
      this.addError('root', 'Configuration must be a valid object');
      return this.getResult();
    }

    this.validateGlobalConfig(config.global);
    this.validateProjects(config.projects);

    return this.getResult();
  }

  /**
   * Validates global configuration settings
   */
  private validateGlobalConfig(global: any): void {
    if (!global) {
      this.addError('global', 'Global configuration is required');
      return;
    }

    if (!global.defaultEnvironment || typeof global.defaultEnvironment !== 'string') {
      this.addError('global.defaultEnvironment', 'Default environment must be a non-empty string');
    }

    if (!Array.isArray(global.supportedEnvironments) || global.supportedEnvironments.length === 0) {
      this.addError('global.supportedEnvironments', 'Supported environments must be a non-empty array');
    } else {
      const validLogLevels = ['debug', 'info', 'warn', 'error'];
      if (global.logLevel && !validLogLevels.includes(global.logLevel)) {
        this.addError('global.logLevel', `Log level must be one of: ${validLogLevels.join(', ')}`);
      }
    }
  }

  /**
   * Validates project configurations
   */
  private validateProjects(projects: any): void {
    if (!projects || typeof projects !== 'object') {
      this.addWarning('No projects configured');
      return;
    }

    Object.entries(projects).forEach(([projectName, config]) => {
      this.validateProject(projectName, config as any);
    });
  }

  /**
   * Validates a single project configuration
   */
  private validateProject(projectName: string, config: any): void {
    const prefix = `projects.${projectName}`;

    if (!config || typeof config !== 'object') {
      this.addError(prefix, 'Project configuration must be an object');
      return;
    }

    // Validate required fields
    if (!config.name || typeof config.name !== 'string') {
      this.addError(`${prefix}.name`, 'Project name is required and must be a string');
    }

    if (!config.version || typeof config.version !== 'string') {
      this.addError(`${prefix}.version`, 'Project version is required and must be a string');
    }

    if (!config.environment || typeof config.environment !== 'string') {
      this.addError(`${prefix}.environment`, 'Project environment is required and must be a string');
    }

    // Validate test configuration
    this.validateTestConfiguration(`${prefix}.testConfiguration`, config.testConfiguration);

    // Validate coverage thresholds
    this.validateCoverageThresholds(`${prefix}.coverageThresholds`, config.coverageThresholds);

    // Validate exclusion patterns
    this.validateExclusionPatterns(`${prefix}.exclusionPatterns`, config.exclusionPatterns);
  }

  /**
   * Validates test configuration
   */
  private validateTestConfiguration(prefix: string, config: any): void {
    if (!config || typeof config !== 'object') {
      this.addError(prefix, 'Test configuration is required and must be an object');
      return;
    }

    if (!Array.isArray(config.testPatterns)) {
      this.addError(`${prefix}.testPatterns`, 'Test patterns must be an array');
    }

    if (!Array.isArray(config.excludePatterns)) {
      this.addError(`${prefix}.excludePatterns`, 'Exclude patterns must be an array');
    }

    if (typeof config.testTimeout !== 'number' || config.testTimeout <= 0) {
      this.addError(`${prefix}.testTimeout`, 'Test timeout must be a positive number');
    }

    if (typeof config.maxConcurrency !== 'number' || config.maxConcurrency <= 0) {
      this.addError(`${prefix}.maxConcurrency`, 'Max concurrency must be a positive number');
    }

    if (typeof config.retryAttempts !== 'number' || config.retryAttempts < 0) {
      this.addError(`${prefix}.retryAttempts`, 'Retry attempts must be a non-negative number');
    }
  }

  /**
   * Validates coverage thresholds
   */
  private validateCoverageThresholds(prefix: string, config: any): void {
    if (!config || typeof config !== 'object') {
      this.addError(prefix, 'Coverage thresholds are required and must be an object');
      return;
    }

    if (!config.global) {
      this.addError(`${prefix}.global`, 'Global coverage thresholds are required');
    } else {
      this.validateThresholdValues(`${prefix}.global`, config.global);
    }

    if (config.perFile) {
      this.validateThresholdValues(`${prefix}.perFile`, config.perFile);
    }
  }

  /**
   * Validates threshold values
   */
  private validateThresholdValues(prefix: string, thresholds: any): void {
    const requiredFields = ['branches', 'functions', 'lines', 'statements'];
    
    requiredFields.forEach(field => {
      const value = thresholds[field];
      if (typeof value !== 'number' || value < 0 || value > 100) {
        this.addError(`${prefix}.${field}`, `${field} threshold must be a number between 0 and 100`);
      }
    });
  }

  /**
   * Validates exclusion patterns
   */
  private validateExclusionPatterns(prefix: string, config: any): void {
    if (!config || typeof config !== 'object') {
      this.addError(prefix, 'Exclusion patterns are required and must be an object');
      return;
    }

    const arrayFields = ['files', 'directories', 'extensions', 'patterns'];
    
    arrayFields.forEach(field => {
      if (config[field] && !Array.isArray(config[field])) {
        this.addError(`${prefix}.${field}`, `${field} must be an array`);
      }
    });
  }

  /**
   * Adds a validation error
   */
  private addError(field: string, message: string, value?: any): void {
    this.errors.push({ field, message, value });
  }

  /**
   * Adds a validation warning
   */
  private addWarning(message: string): void {
    this.warnings.push(message);
  }

  /**
   * Returns validation result
   */
  private getResult(): { isValid: boolean; errors: ValidationError[]; warnings: string[] } {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}