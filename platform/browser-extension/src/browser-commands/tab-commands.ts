import { sendToServer } from '../messaging.js';
import { sanitizeErrorMessage } from '../sanitize-error.js';
import { isBlockedUrlScheme, toErrorMessage } from '@opentabs-dev/shared';

/** Lists all open Chrome tabs with their IDs, URLs, titles, active state, and window IDs. */
export const handleBrowserListTabs = async (id: string | number): Promise<void> => {
  try {
    const tabs = await chrome.tabs.query({});
    const result = tabs.map(tab => ({
      id: tab.id,
      title: tab.title ?? '',
      url: tab.url ?? '',
      active: tab.active,
      windowId: tab.windowId,
    }));
    sendToServer({ jsonrpc: '2.0', result, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Opens a new Chrome tab with the specified URL.
 * @param params - Expects `{ url: string }`. Rejects blocked URL schemes (javascript:, data:, etc.).
 * @returns The new tab's ID, title, URL, and window ID.
 */
export const handleBrowserOpenTab = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
  try {
    const url = params.url;
    if (typeof url !== 'string') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid url parameter' }, id });
      return;
    }
    if (isBlockedUrlScheme(url)) {
      sendToServer({
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: 'URL scheme not allowed (javascript:, data:, file:, chrome:, blob: are blocked)',
        },
        id,
      });
      return;
    }
    const tab = await chrome.tabs.create({ url });
    sendToServer({
      jsonrpc: '2.0',
      result: { id: tab.id, title: tab.title ?? '', url: tab.url ?? url, windowId: tab.windowId },
      id,
    });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Closes a Chrome tab by its ID.
 * @param params - Expects `{ tabId: number }`.
 * @returns `{ ok: true }` on success.
 */
export const handleBrowserCloseTab = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    await chrome.tabs.remove(tabId);
    sendToServer({ jsonrpc: '2.0', result: { ok: true }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Navigates an existing tab to a new URL.
 * @param params - Expects `{ tabId: number, url: string }`. Rejects blocked URL schemes.
 * @returns The tab's ID, title, and navigated URL.
 */
export const handleBrowserNavigateTab = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
  try {
    const tabId = params.tabId;
    const url = params.url;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    if (typeof url !== 'string') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid url parameter' }, id });
      return;
    }
    if (isBlockedUrlScheme(url)) {
      sendToServer({
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: 'URL scheme not allowed (javascript:, data:, file:, chrome:, blob: are blocked)',
        },
        id,
      });
      return;
    }
    const tab = await chrome.tabs.update(tabId, { url });
    sendToServer({
      jsonrpc: '2.0',
      result: { id: tab?.id ?? tabId, title: tab?.title ?? '', url: tab?.url ?? url },
      id,
    });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Activates a tab and brings its window to the foreground.
 * @param params - Expects `{ tabId: number }`.
 * @returns The focused tab's ID, title, URL, and active state.
 */
export const handleBrowserFocusTab = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const tab = await chrome.tabs.update(tabId, { active: true });
    if (!tab) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: `Tab ${tabId} not found` }, id });
      return;
    }
    await chrome.windows.update(tab.windowId, { focused: true });
    sendToServer({
      jsonrpc: '2.0',
      result: { id: tab.id, title: tab.title ?? '', url: tab.url ?? '', active: true },
      id,
    });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Retrieves detailed metadata for a single tab including status, favicon URL, and incognito state.
 * @param params - Expects `{ tabId: number }`.
 * @returns Tab metadata: ID, title, URL, status, active, windowId, favIconUrl, and incognito.
 */
export const handleBrowserGetTabInfo = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const tab = await chrome.tabs.get(tabId);
    sendToServer({
      jsonrpc: '2.0',
      result: {
        id: tab.id,
        title: tab.title ?? '',
        url: tab.url ?? '',
        status: tab.status ?? '',
        active: tab.active,
        windowId: tab.windowId,
        favIconUrl: tab.favIconUrl ?? '',
        incognito: tab.incognito,
      },
      id,
    });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};
