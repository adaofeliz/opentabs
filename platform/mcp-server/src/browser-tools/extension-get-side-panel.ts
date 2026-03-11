/**
 * extension_get_side_panel — returns the side panel's current React state and rendered HTML.
 * If the side panel is not open, returns { open: false }.
 */

import { z } from 'zod';
import { dispatchToExtension } from '../extension-protocol.js';
import { defineBrowserTool } from './definition.js';

const extensionGetSidePanel = defineBrowserTool({
  name: 'extension_get_side_panel',
  description:
    'Get the side panel state and rendered HTML. ' +
    'Returns the React state (connected, loading, plugins) and the root innerHTML. ' +
    'If the side panel is not open, returns { open: false }. ' +
    'When multiple browser profiles are connected, use connectionId to target a specific profile.',
  summary: 'Get side panel state and HTML',
  icon: 'panel-right',
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
    dispatchToExtension(state, 'extension.getSidePanel', {
      ...(args.connectionId ? { connectionId: args.connectionId } : {}),
    }),
});

export { extensionGetSidePanel };
