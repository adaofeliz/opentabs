/**
 * Browser tools barrel — collects all browser tool definitions into a single array.
 */

import { clickElement } from './click-element.js';
import { closeTab } from './close-tab.js';
import { executeScript } from './execute-script.js';
import { focusTab } from './focus-tab.js';
import { getTabContent } from './get-tab-content.js';
import { getTabInfo } from './get-tab-info.js';
import { listTabs } from './list-tabs.js';
import { navigateTab } from './navigate-tab.js';
import { openTab } from './open-tab.js';
import { reloadExtension } from './reload-extension.js';
import { screenshotTab } from './screenshot-tab.js';
import { selectOption } from './select-option.js';
import { typeText } from './type-text.js';
import type { BrowserToolDefinition } from './definition.js';

const browserTools: BrowserToolDefinition[] = [
  reloadExtension,
  listTabs,
  openTab,
  closeTab,
  navigateTab,
  focusTab,
  getTabInfo,
  executeScript,
  screenshotTab,
  getTabContent,
  clickElement,
  typeText,
  selectOption,
];

export { browserTools };
