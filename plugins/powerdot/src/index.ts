import { OpenTabsPlugin, defineTool } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { isPageReady } from './powerdot-api.js';

// Temporary placeholder — will be replaced when real tools are added in subsequent tasks
const _placeholder = defineTool({
  name: 'placeholder',
  displayName: 'Placeholder',
  description: 'Placeholder tool — will be replaced by real charger tools',
  input: z.object({}),
  output: z.object({}),
  async handle() {
    return {};
  },
});

class PowerDotPlugin extends OpenTabsPlugin {
  readonly name = 'powerdot';
  readonly description = 'OpenTabs plugin for PowerDot EV charger search';
  override readonly displayName = 'PowerDot';
  readonly urlPatterns = ['*://*.powerdot.eu/*'];
  override readonly homepage = 'https://powerdot.eu/en';
  readonly tools: ToolDefinition[] = [_placeholder];

  async isReady(): Promise<boolean> {
    // PowerDot is a public website — no authentication required.
    // The plugin is ready once the page DOM is loaded.
    return isPageReady();
  }
}

export default new PowerDotPlugin();
