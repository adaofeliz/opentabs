import { OpenTabsPlugin } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';

// PowerDot is a public website — no authentication required.
// isReady() returns true once the page DOM is loaded.
const isPageReady = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.readyState === 'complete' || document.readyState === 'interactive';
};

class PowerDotPlugin extends OpenTabsPlugin {
  readonly name = 'powerdot';
  readonly description = 'OpenTabs plugin for PowerDot EV charger search';
  override readonly displayName = 'PowerDot';
  readonly urlPatterns = ['*://*.powerdot.eu/*'];
  override readonly homepage = 'https://powerdot.eu/en';
  readonly tools: ToolDefinition[] = [
    {
      name: 'placeholder',
      displayName: 'Placeholder',
      description: 'Placeholder tool to satisfy plugin validation during scaffold',
      summary: 'No-op placeholder tool',
      input: z.object({}),
      output: z.object({}),
      async handle() {
        return {};
      },
    },
  ];

  async isReady(): Promise<boolean> {
    return isPageReady();
  }
}

export default new PowerDotPlugin();
