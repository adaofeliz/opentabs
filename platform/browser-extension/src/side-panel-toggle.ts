// Side panel toggle — manages per-window open state using Chrome's
// authoritative onOpened/onClosed events (Chrome 141+) and toggles
// the side panel via the action click handler.

import { persistOpenWindows } from './side-panel-state.js';

const openWindows = new Set<number>();

/** Initialize side panel toggle behavior and register Chrome event listeners */
export const initSidePanelToggle = (): void => {
  // Take manual control of the side panel so we can open/close it on action click.
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

  chrome.sidePanel.onOpened.addListener(({ windowId }) => {
    openWindows.add(windowId);
    persistOpenWindows(openWindows);
  });

  chrome.sidePanel.onClosed.addListener(({ windowId }) => {
    openWindows.delete(windowId);
    persistOpenWindows(openWindows);
  });

  chrome.action.onClicked.addListener(({ windowId }) => {
    if (openWindows.has(windowId)) {
      chrome.sidePanel.close({ windowId }).catch(() => {});
    } else {
      chrome.sidePanel.open({ windowId }).catch(() => {});
    }
  });
};

/**
 * Populate the in-memory openWindows set with window IDs restored from
 * chrome.storage.local on startup. Called from background.ts after
 * restoreSidePanels() resolves.
 */
export const trackRestoredWindows = (windowIds: Set<number>): void => {
  for (const id of windowIds) {
    openWindows.add(id);
  }
};
