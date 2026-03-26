import { OpenTabsPlugin } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';
import { isPageReady } from './powerdot-api.js';
import { listAllChargers } from './tools/list-all-chargers.js';
import { getChargerDetails } from './tools/get-charger-details.js';
import { searchChargersByCountry } from './tools/search-chargers-by-country.js';
import { searchChargersByLocation } from './tools/search-chargers-by-location.js';

class PowerDotPlugin extends OpenTabsPlugin {
  readonly name = 'powerdot';
  readonly description = 'OpenTabs plugin for PowerDot EV charger search';
  override readonly displayName = 'PowerDot';
  readonly urlPatterns = ['*://*.powerdot.eu/*'];
  override readonly homepage = 'https://powerdot.eu/en';
  readonly tools: ToolDefinition[] = [
    listAllChargers,
    getChargerDetails,
    searchChargersByCountry,
    searchChargersByLocation,
  ];

  async isReady(): Promise<boolean> {
    // PowerDot is a public website — no authentication required.
    // The plugin is ready once the page DOM is loaded.
    return isPageReady();
  }
}

export default new PowerDotPlugin();
