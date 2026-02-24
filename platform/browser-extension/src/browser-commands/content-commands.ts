import { SCREENSHOT_RENDER_DELAY_MS } from '../constants.js';
import { sendToServer } from '../messaging.js';
import { sanitizeErrorMessage } from '../sanitize-error.js';
import { toErrorMessage } from '@opentabs-dev/shared';

/**
 * Extracts the innerText of a DOM element in a tab's page context.
 * @param params - Expects `{ tabId: number, selector?: string, maxLength?: number }`. Defaults to `body` selector and 50000 max length.
 * @returns `{ title, url, content }` with the element's trimmed text content.
 */
export const handleBrowserGetTabContent = async (
  params: Record<string, unknown>,
  id: string | number,
): Promise<void> => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const selector = typeof params.selector === 'string' ? params.selector : 'body';
    const maxLength = typeof params.maxLength === 'number' ? params.maxLength : 50000;

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: (sel: string, max: number) => {
        const el = document.querySelector(sel);
        if (!el) return { error: `Element not found: ${sel}` };
        return {
          title: document.title,
          url: document.URL,
          content: ((el as HTMLElement).innerText || '').trim().slice(0, max),
        };
      },
      args: [selector, maxLength],
    });

    const result = results[0]?.result as { error?: string; title?: string; url?: string; content?: string } | undefined;
    if (!result) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32603, message: 'No result from script execution' }, id });
      return;
    }
    if (result.error) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: result.error }, id });
      return;
    }
    sendToServer({ jsonrpc: '2.0', result: { title: result.title, url: result.url, content: result.content }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Returns the outerHTML of a DOM element in a tab's page context.
 * @param params - Expects `{ tabId: number, selector?: string, maxLength?: number }`. Defaults to `html` selector and 200000 max length.
 * @returns `{ title, url, html }` with the element's outer HTML, truncated if exceeding maxLength.
 */
export const handleBrowserGetPageHtml = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const selector = typeof params.selector === 'string' ? params.selector : 'html';
    const maxLength = typeof params.maxLength === 'number' ? params.maxLength : 200000;

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: (sel: string, max: number) => {
        const el = document.querySelector(sel);
        if (!el) return { error: `Element not found: ${sel}` };
        const html = el.outerHTML;
        return {
          title: document.title,
          url: document.URL,
          html: html.length > max ? html.slice(0, max) + '... (truncated)' : html,
        };
      },
      args: [selector, maxLength],
    });

    const result = results[0]?.result as { error?: string; title?: string; url?: string; html?: string } | undefined;
    if (!result) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32603, message: 'No result from script execution' }, id });
      return;
    }
    if (result.error) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: result.error }, id });
      return;
    }
    sendToServer({ jsonrpc: '2.0', result: { title: result.title, url: result.url, html: result.html }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Reads localStorage or sessionStorage from a tab's page context.
 * @param params - Expects `{ tabId: number, storageType?: 'local' | 'session', key?: string }`. Without `key`, returns all entries up to a size limit.
 * @returns A single `{ key, value }` when key is provided, or `{ entries, count }` for all entries.
 */
export const handleBrowserGetStorage = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const storageType = typeof params.storageType === 'string' ? params.storageType : 'local';
    if (storageType !== 'local' && storageType !== 'session') {
      sendToServer({
        jsonrpc: '2.0',
        error: { code: -32602, message: "storageType must be 'local' or 'session'" },
        id,
      });
      return;
    }
    const key = typeof params.key === 'string' ? params.key : undefined;

    const MAX_VALUE_LENGTH = 10000;
    const MAX_RESPONSE_LENGTH = 500_000;

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: (type: string, k: string | null, maxVal: number, maxResp: number) => {
        const storage = type === 'session' ? window.sessionStorage : window.localStorage;

        if (k !== null) {
          const value = storage.getItem(k);
          return {
            mode: 'single' as const,
            key: k,
            value: value !== null && value.length > maxVal ? value.slice(0, maxVal) + '... (truncated)' : value,
          };
        }

        const entries: Array<{ key: string; value: string }> = [];
        let totalLength = 0;
        const keys = Object.keys(storage);
        for (const entryKey of keys) {
          const raw = storage.getItem(entryKey);
          if (raw === null) continue;
          const value = raw.length > maxVal ? raw.slice(0, maxVal) + '... (truncated)' : raw;
          const entryLength = entryKey.length + value.length;
          if (totalLength + entryLength > maxResp) break;
          entries.push({ key: entryKey, value });
          totalLength += entryLength;
        }
        return { mode: 'all' as const, entries, count: keys.length };
      },
      args: [storageType, key ?? null, MAX_VALUE_LENGTH, MAX_RESPONSE_LENGTH],
    });

    const result = results[0]?.result as
      | { mode: 'single'; key: string; value: string | null }
      | { mode: 'all'; entries: Array<{ key: string; value: string }>; count: number }
      | undefined;

    if (!result) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32603, message: 'No result from script execution' }, id });
      return;
    }

    if (result.mode === 'single') {
      sendToServer({ jsonrpc: '2.0', result: { key: result.key, value: result.value }, id });
    } else {
      sendToServer({ jsonrpc: '2.0', result: { entries: result.entries, count: result.count }, id });
    }
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

/**
 * Captures a PNG screenshot of a tab by focusing it and using chrome.tabs.captureVisibleTab.
 * @param params - Expects `{ tabId: number }`.
 * @returns `{ image: string }` containing the base64-encoded PNG data.
 */
export const handleBrowserScreenshotTab = async (
  params: Record<string, unknown>,
  id: string | number,
): Promise<void> => {
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
    await new Promise(resolve => setTimeout(resolve, SCREENSHOT_RENDER_DELAY_MS));
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    sendToServer({ jsonrpc: '2.0', result: { image: base64 }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};
