/**
 * browser_open_tab — opens a new browser tab with the given URL.
 */

import { z } from 'zod';
import { dispatchToExtension } from '../extension-protocol.js';
import { defineBrowserTool } from './definition.js';
import { safeUrl } from './url-validation.js';

const openTab = defineBrowserTool({
  name: 'browser_open_tab',
  description:
    'Open a new browser tab with the specified URL. Returns the new tab ID, ' +
    'which can be used with browser_navigate_tab, browser_close_tab, and browser_execute_script. ' +
    'When multiple browser profiles are connected, use connectionId to target a specific profile ' +
    '(get connectionIds from browser_list_tabs). Without connectionId, opens in an arbitrary profile.',
  summary: 'Open a new browser tab',
  icon: 'plus',
  group: 'Tabs',
  input: z.object({
    url: safeUrl.describe('URL to open in a new tab'),
    connectionId: z
      .string()
      .optional()
      .describe(
        'Target a specific browser profile by connection ID. Use browser_list_tabs to discover available connectionIds. ' +
          'When omitted and multiple profiles are connected, the tab opens in an arbitrary profile.',
      ),
  }),
  handler: async (args, state) =>
    dispatchToExtension(state, 'browser.openTab', {
      url: args.url,
      ...(args.connectionId ? { connectionId: args.connectionId } : {}),
    }),
});

export { openTab };
