import { sendToServer } from '../messaging.js';
import { clearConsoleLogs, getConsoleLogs, getRequests, startCapture, stopCapture } from '../network-capture.js';
import { sanitizeErrorMessage } from '../sanitize-error.js';
import { toErrorMessage } from '@opentabs-dev/shared';

export const handleBrowserEnableNetworkCapture = async (
  params: Record<string, unknown>,
  id: string | number,
): Promise<void> => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const maxRequests = typeof params.maxRequests === 'number' ? params.maxRequests : 100;
    const urlFilter = typeof params.urlFilter === 'string' ? params.urlFilter : undefined;
    const maxConsoleLogs = typeof params.maxConsoleLogs === 'number' ? params.maxConsoleLogs : 500;

    await startCapture(tabId, maxRequests, urlFilter, maxConsoleLogs);
    sendToServer({ jsonrpc: '2.0', result: { enabled: true, tabId }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

export const handleBrowserGetNetworkRequests = (params: Record<string, unknown>, id: string | number): void => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const clear = typeof params.clear === 'boolean' ? params.clear : false;
    const requests = getRequests(tabId, clear);
    sendToServer({ jsonrpc: '2.0', result: { requests }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

export const handleBrowserDisableNetworkCapture = (params: Record<string, unknown>, id: string | number): void => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    stopCapture(tabId);
    sendToServer({ jsonrpc: '2.0', result: { disabled: true, tabId }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

export const handleBrowserGetConsoleLogs = (params: Record<string, unknown>, id: string | number): void => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    const clear = typeof params.clear === 'boolean' ? params.clear : false;
    const level = typeof params.level === 'string' ? params.level : undefined;
    const logs = getConsoleLogs(tabId, clear, level);
    sendToServer({ jsonrpc: '2.0', result: { logs }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};

export const handleBrowserClearConsoleLogs = (params: Record<string, unknown>, id: string | number): void => {
  try {
    const tabId = params.tabId;
    if (typeof tabId !== 'number') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid tabId parameter' }, id });
      return;
    }
    clearConsoleLogs(tabId);
    sendToServer({ jsonrpc: '2.0', result: { cleared: true }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};
