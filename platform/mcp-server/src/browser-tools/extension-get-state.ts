/**
 * extension_get_state — returns comprehensive internal state of the Chrome extension.
 * Includes WebSocket connection status, all plugins with tab states, active network
 * captures, and offscreen document status.
 */

import { z } from 'zod';
import { dispatchToExtension } from '../extension-protocol.js';
import { defineBrowserTool } from './definition.js';

const extensionGetState = defineBrowserTool({
  name: 'extension_get_state',
  description:
    'Get the complete internal state of the OpenTabs Chrome extension. ' +
    'Returns WebSocket connection status, all registered plugins with their tab states, ' +
    'active network captures, and offscreen document status. ' +
    'Use this tool to quickly understand the overall health of the extension without opening DevTools. ' +
    'When multiple browser profiles are connected, use connectionId to target a specific profile.',
  summary: 'Get extension internal state',
  icon: 'settings',
  group: 'Extension',
  input: z.object({
    connectionId: z
      .string()
      .optional()
      .describe(
        'Target a specific browser profile by connection ID. Use browser_list_tabs to discover available connectionIds.',
      ),
  }),
  handler: async (args, state) =>
    dispatchToExtension(state, 'extension.getState', {
      ...(args.connectionId ? { connectionId: args.connectionId } : {}),
    }),
});

export { extensionGetState };
