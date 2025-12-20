import { ConfigurationLoader } from './loader';
import { ConfigurationValidator } from './validator';
import { ConfigurationSchema, ProjectConfiguration, ConfigurationLoadResult } from './types';
import { DEFAULT_CONFIGURATION } from './defaults';

/**
 * Main configuration manager that handles loading, validation, and management
 * of test configurations, coverage thresholds, and exclusion patterns
 */
export class ConfigurationManager {
  private loader = new ConfigurationLoader();
  private validator = new ConfigurationValidator();
  private currentConfiguration: ConfigurationSchema | null = null;
  private configurationPath: string | null = null;

  /**
   * Initializes the configuration manager
   */
  async initialize(configPath?: string): Promise<ConfigurationLoadResult> {
    try {
      // Find configuration file if not provided
      if (!configPath) {
        const foundPath = await this.loader.findConfigurationFile();
        if (!foundPath) {
          // Use default configuration if no file found
          this.currentConfiguration = DEFAULT_CONFIGURATION;
          return {
            success: true,
            configuration: this.currentConfiguration,
            warnings: ['No configuration file found, using defaults']
          };
        }
        configPath = foundPath;
      }

      // Load configuration from file
      const result = await this.loader.loadFromFile(configPath);
      
      if (result.success && result.configuration) {
        this.currentConfiguration = result.configuration;
        this.configurationPath = configPath;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'initialization', message: `Failed to initialize configuration manager: ${error}` }]
      };
    }
  }

  /**
   * Gets the current configuration
   */
  getConfiguration(): ConfigurationSchema | null {
    return this.currentConfiguration;
  }

  /**
   * Gets configuration for a specific project
   */
  getProjectConfiguration(projectName: string, environment?: string): ProjectConfiguration | null {
    if (!this.currentConfiguration) {
      return null;
    }

    const projectConfig = this.currentConfiguration.projects[projectName];
    if (!projectConfig) {
      return null;
    }

    // Return environment-specific configuration if requested
    if (environment && environment !== projectConfig.environment) {
      return {
        ...projectConfig,
        environment
      };
    }

    return projectConfig;
  }

  /**
   * Gets all available project names
   */
  getProjectNames(): string[] {
    if (!this.currentConfiguration) {
      return [];
    }

    return Object.keys(this.currentConfiguration.projects);
  }

  /**
   * Gets supported environments
   */
  getSupportedEnvironments(): string[] {
    if (!this.currentConfiguration) {
      return DEFAULT_CONFIGURATION.global.supportedEnvironments;
    }

    return this.currentConfiguration.global.supportedEnvironments;
  }

  /**
   * Gets the default environment
   */
  getDefaultEnvironment(): string {
    if (!this.currentConfiguration) {
      return DEFAULT_CONFIGURATION.global.defaultEnvironment;
    }

    return this.currentConfiguration.global.defaultEnvironment;
  }

  /**
   * Validates if a project exists
   */
  hasProject(projectName: string): boolean {
    if (!this.currentConfiguration) {
      return false;
    }

    return projectName in this.currentConfiguration.projects;
  }

  /**
   * Validates if an environment is supported
   */
  isEnvironmentSupported(environment: string): boolean {
    return this.getSupportedEnvironments().includes(environment);
  }

  /**
   * Loads configuration for a specific project and environment
   */
  async loadProjectConfiguration(
    projectName: string,
    environment?: string
  ): Promise<ConfigurationLoadResult> {
    if (!this.configurationPath) {
      return {
        success: false,
        errors: [{ field: 'path', message: 'No configuration file path available' }]
      };
    }

    return this.loader.loadProjectConfiguration(
      this.configurationPath,
      projectName,
      environment
    );
  }

  /**
   * Reloads the current configuration
   */
  async reload(): Promise<ConfigurationLoadResult> {
    if (!this.configurationPath) {
      return {
        success: false,
        errors: [{ field: 'reload', message: 'No configuration file to reload' }]
      };
    }

    // Clear cache and reload
    this.loader.clearCache();
    return this.initialize(this.configurationPath);
  }

  /**
   * Creates a new configuration file with default settings
   */
  async createConfiguration(
    outputPath: string,
    projectName: string
  ): Promise<void> {
    await this.loader.createDefaultConfiguration(outputPath, projectName);
  }

  /**
   * Validates a configuration object
   */
  validateConfiguration(config: any): { isValid: boolean; errors: any[]; warnings: string[] } {
    return this.validator.validate(config);
  }

  /**
   * Gets test patterns for a project
   */
  getTestPatterns(projectName: string): string[] {
    const projectConfig = this.getProjectConfiguration(projectName);
    return projectConfig?.testConfiguration.testPatterns || [];
  }

  /**
   * Gets exclusion patterns for a project
   */
  getExclusionPatterns(projectName: string): {
    files: string[];
    directories: string[];
    extensions: string[];
    patterns: string[];
  } {
    const projectConfig = this.getProjectConfiguration(projectName);
    return projectConfig?.exclusionPatterns || {
      files: [],
      directories: [],
      extensions: [],
      patterns: []
    };
  }

  /**
   * Gets coverage thresholds for a project
   */
  getCoverageThresholds(projectName: string): {
    global: { branches: number; functions: number; lines: number; statements: number };
    perFile?: { branches: number; functions: number; lines: number; statements: number };
  } | null {
    const projectConfig = this.getProjectConfiguration(projectName);
    return projectConfig?.coverageThresholds || null;
  }

  /**
   * Gets the current configuration file path
   */
  getConfigurationPath(): string | null {
    return this.configurationPath;
  }

  /**
   * Checks if the manager is initialized
   */
  isInitialized(): boolean {
    return this.currentConfiguration !== null;
  }

  /**
   * Gets configuration summary for debugging
   */
  getConfigurationSummary(): {
    initialized: boolean;
    configPath: string | null;
    projectCount: number;
    supportedEnvironments: string[];
    defaultEnvironment: string;
  } {
    return {
      initialized: this.isInitialized(),
      configPath: this.configurationPath,
      projectCount: this.getProjectNames().length,
      supportedEnvironments: this.getSupportedEnvironments(),
      defaultEnvironment: this.getDefaultEnvironment()
    };
  }
}