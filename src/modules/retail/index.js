import { retailConfig } from './config/retail.config.js';
import { retailNavigation } from './navigation/index.jsx';
import { retailRoutes } from './navigation/routes.jsx';

/**
 * Retail business module definition.
 * Screens, components, and features are added within this module boundary.
 */
export const retailModule = {
  id: retailConfig.id,
  name: retailConfig.name,
  routes: retailRoutes,
  navigation: retailNavigation,
  config: retailConfig,
};
