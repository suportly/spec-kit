export { ConfigurationManager } from './manager';
export { ConfigurationLoader } from './loader';
export { ConfigurationValidator } from './validator';
export * from './types';
export * from './defaults';

// Create a singleton instance for global use
export const configManager = new ConfigurationManager();