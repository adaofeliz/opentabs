/**
 * browser_list_tabs — lists all open browser tabs.
 */

import { defineBrowserTool } from './definition.js';
import { dispatchToExtension } from '../extension-protocol.js';
import { z } from 'zod';

const listTabs = defineBrowserTool({
  name: 'browser_list_tabs',
  description:
    'List all open browser tabs. Returns tab ID, title, URL, and active status for each tab. ' +
    'Use the returned tab IDs with browser_close_tab, browser_navigate_tab, and browser_execute_script.',
  input: z.object({}),
  handler: async (_args, state) => dispatchToExtension(state, 'browser.listTabs', {}),
});

export { listTabs };
