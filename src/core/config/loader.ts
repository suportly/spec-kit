import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { ConfigurationSchema, ConfigurationLoadResult, ProjectConfiguration } from './types';
import { DEFAULT_CONFIGURATION, DEFAULT_TEST_CONFIGURATION, DEFAULT_COVERAGE_THRESHOLDS, DEFAULT_EXCLUSION_PATTERNS } from './defaults';
import { ConfigurationValidator } from './validator';

export class ConfigurationLoader {
  private validator = new ConfigurationValidator();
  private configCache = new Map<string, ConfigurationSchema>();

  /**
   * Loads configuration from file with caching
   */
  async loadFromFile(configPath: string): Promise<ConfigurationLoadResult> {
    try {
      const absolutePath = resolve(configPath);
      
      // Check cache first
      if (this.configCache.has(absolutePath)) {
        return {
          success: true,
          configuration: this.configCache.get(absolutePath)!
        };
      }

      // Check if file exists
      try {
        await fs.access(absolutePath);
      } catch {
        return {
          success: false,
          errors: [{ field: 'file', message: `Configuration file not found: ${absolutePath}` }]
        };
      }

      // Read and parse file
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      let rawConfig: any;

      try {
        rawConfig = JSON.parse(fileContent);
      } catch (parseError) {
        return {
          success: false,
          errors: [{ field: 'parse', message: `Invalid JSON in configuration file: ${parseError}` }]
        };
      }

      // Validate configuration
      const validation = this.validator.validate(rawConfig);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        };
      }

      // Merge with defaults and normalize
      const configuration = this.normalizeConfiguration(rawConfig);
      
      // Cache the result
      this.configCache.set(absolutePath, configuration);

      return {
        success: true,
        configuration,
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'load', message: `Failed to load configuration: ${error}` }]
      };
    }
  }

  /**
   * Loads configuration for a specific project and environment
   */
  async loadProjectConfiguration(
    configPath: string,
    projectName: string,
    environment?: string
  ): Promise<ConfigurationLoadResult> {
    const result = await this.loadFromFile(configPath);
    
    if (!result.success || !result.configuration) {
      return result;
    }

    const config = result.configuration;
    const targetEnvironment = environment || config.global.defaultEnvironment;

    // Find project configuration
    const projectConfig = config.projects[projectName];
    if (!projectConfig) {
      return {
        success: false,
        errors: [{ field: 'project', message: `Project '${projectName}' not found in configuration` }]
      };
    }

    // Validate environment
    if (!config.global.supportedEnvironments.includes(targetEnvironment)) {
      return {
        success: false,
        errors: [{ 
          field: 'environment', 
          message: `Environment '${targetEnvironment}' is not supported. Supported: ${config.global.supportedEnvironments.join(', ')}` 
        }]
      };
    }

    // Create environment-specific configuration
    const environmentConfig = {
      ...projectConfig,
      environment: targetEnvironment
    };

    return {
      success: true,
      configuration: {
        ...config,
        projects: {
          [projectName]: environmentConfig
        }
      },
      warnings: result.warnings
    };
  }

  /**
   * Searches for configuration files in common locations
   */
  async findConfigurationFile(startDir: string = process.cwd()): Promise<string | null> {
    const configNames = [
      'spec-kit.config.json',
      'speckit.config.json',
      '.spec-kit.json',
      '.speckit.json'
    ];

    const searchPaths = [
      startDir,
      join(startDir, 'config'),
      join(startDir, '.config'),
      process.cwd()
    ];

    for (const searchPath of searchPaths) {
      for (const configName of configNames) {
        const configPath = join(searchPath, configName);
        try {
          await fs.access(configPath);
          return configPath;
        } catch {
          // Continue searching
        }
      }
    }

    return null;
  }

  /**
   * Creates a default configuration file
   */
  async createDefaultConfiguration(outputPath: string, projectName: string): Promise<void> {
    const defaultConfig: ConfigurationSchema = {
      ...DEFAULT_CONFIGURATION,
      projects: {
        [projectName]: {
          name: projectName,
          version: '1.0.0',
          description: `Configuration for ${projectName}`,
          testConfiguration: DEFAULT_TEST_CONFIGURATION,
          coverageThresholds: DEFAULT_COVERAGE_THRESHOLDS,
          exclusionPatterns: DEFAULT_EXCLUSION_PATTERNS,
          environment: 'development'
        }
      }
    };

    const configContent = JSON.stringify(defaultConfig, null, 2);
    await fs.writeFile(outputPath, configContent, 'utf-8');
  }

  /**
   * Normalizes configuration by merging with defaults
   */
  private normalizeConfiguration(rawConfig: any): ConfigurationSchema {
    const config: ConfigurationSchema = {
      global: {
        ...DEFAULT_CONFIGURATION.global,
        ...rawConfig.global
      },
      projects: {}
    };

    // Normalize each project configuration
    if (rawConfig.projects) {
      Object.entries(rawConfig.projects).forEach(([projectName, projectConfig]: [string, any]) => {
        config.projects[projectName] = this.normalizeProjectConfiguration(projectConfig);
      });
    }

    return config;
  }

  /**
   * Normalizes a single project configuration
   */
  private normalizeProjectConfiguration(projectConfig: any): ProjectConfiguration {
    return {
      name: projectConfig.name,
      version: projectConfig.version,
      description: projectConfig.description,
      environment: projectConfig.environment,
      testConfiguration: {
        ...DEFAULT_TEST_CONFIGURATION,
        ...projectConfig.testConfiguration
      },
      coverageThresholds: {
        global: {
          ...DEFAULT_COVERAGE_THRESHOLDS.global,
          ...projectConfig.coverageThresholds?.global
        },
        ...(projectConfig.coverageThresholds?.perFile && {
          perFile: {
            ...DEFAULT_COVERAGE_THRESHOLDS.perFile,
            ...projectConfig.coverageThresholds.perFile
          }
        })
      },
      exclusionPatterns: {
        ...DEFAULT_EXCLUSION_PATTERNS,
        ...projectConfig.exclusionPatterns
      },
      customSettings: projectConfig.customSettings || {}
    };
  }

  /**
   * Clears the configuration cache
   */
  clearCache(): void {
    this.configCache.clear();
  }

  /**
   * Gets cached configuration paths
   */
  getCachedPaths(): string[] {
    return Array.from(this.configCache.keys());
  }
}