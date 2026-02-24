import { sendToServer } from '../messaging.js';
import { sanitizeErrorMessage } from '../sanitize-error.js';
import { isBlockedUrlScheme, toErrorMessage } from '@opentabs-dev/shared';

/**
 * Retrieves cookies for a URL, optionally filtered by cookie name.
 * @param params - Expects `{ url: string, name?: string }`. Rejects blocked URL schemes.
 * @returns `{ cookies }` array with name, value, domain, path, secure, httpOnly, sameSite, and expirationDate.
 */
export const handleBrowserGetCookies = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
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
    const filter: chrome.cookies.GetAllDetails = { url };
    const name = params.name;
    if (typeof name === 'string') {
      filter.name = name;
    }
    const cookies = await chrome.cookies.getAll(filter);
    sendToServer({
      jsonrpc: '2.0',
      result: {
        cookies: cookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite,
          expirationDate: c.expirationDate,
        })),
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

/**
 * Sets a cookie with the specified name, value, and optional attributes (domain, path, secure, httpOnly, expirationDate).
 * @param params - Expects `{ url: string, name: string, value: string, domain?: string, path?: string, secure?: boolean, httpOnly?: boolean, expirationDate?: number }`.
 * @returns The cookie as set by Chrome, including all resolved attributes.
 */
export const handleBrowserSetCookie = async (params: Record<string, unknown>, id: string | number): Promise<void> => {
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
    const name = params.name;
    if (typeof name !== 'string' || name.length === 0) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid name parameter' }, id });
      return;
    }
    const value = params.value;
    if (typeof value !== 'string') {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid value parameter' }, id });
      return;
    }
    const details: chrome.cookies.SetDetails = { url, name, value };
    if (typeof params.domain === 'string') details.domain = params.domain;
    if (typeof params.path === 'string') details.path = params.path;
    if (typeof params.secure === 'boolean') details.secure = params.secure;
    if (typeof params.httpOnly === 'boolean') details.httpOnly = params.httpOnly;
    if (typeof params.expirationDate === 'number') details.expirationDate = params.expirationDate;
    const cookie = await chrome.cookies.set(details);
    if (!cookie) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32603, message: 'Failed to set cookie' }, id });
      return;
    }
    sendToServer({
      jsonrpc: '2.0',
      result: {
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
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

export const handleBrowserDeleteCookies = async (
  params: Record<string, unknown>,
  id: string | number,
): Promise<void> => {
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
    const name = params.name;
    if (typeof name !== 'string' || name.length === 0) {
      sendToServer({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing or invalid name parameter' }, id });
      return;
    }
    await chrome.cookies.remove({ url, name });
    sendToServer({ jsonrpc: '2.0', result: { deleted: true, name, url }, id });
  } catch (err) {
    sendToServer({
      jsonrpc: '2.0',
      error: { code: -32603, message: sanitizeErrorMessage(toErrorMessage(err)) },
      id,
    });
  }
};
