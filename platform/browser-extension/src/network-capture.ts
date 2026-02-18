// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Maximum character length for request bodies before truncation. */
const MAX_BODY_LENGTH = 102_400;

interface CapturedRequest {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  mimeType?: string;
  timestamp: number;
}

interface ConsoleEntry {
  level: string;
  message: string;
  timestamp: number;
}

interface CaptureState {
  requests: CapturedRequest[];
  consoleLogs: ConsoleEntry[];
  maxRequests: number;
  urlFilter?: string;
  pendingRequests: Map<string, Partial<CapturedRequest>>;
}

interface HeaderEntry {
  name: string;
  value?: string;
}

// ---------------------------------------------------------------------------
// Per-tab capture state
// ---------------------------------------------------------------------------

const captures = new Map<number, CaptureState>();

// ---------------------------------------------------------------------------
// Chrome debugger event listener (registered once at module load)
// ---------------------------------------------------------------------------

/**
 * Convert Chrome DevTools Protocol headers (array of { name, value }) to a
 * plain Record. CDP sometimes sends headers as an object and sometimes as an
 * array depending on the event — handle both.
 */
const headersToRecord = (raw: unknown): Record<string, string> | undefined => {
  if (!raw) return undefined;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, string>;
  }
  if (Array.isArray(raw)) {
    const record: Record<string, string> = {};
    for (const entry of raw as HeaderEntry[]) {
      if (typeof entry.name === 'string') {
        record[entry.name] = entry.value !== undefined ? entry.value : '';
      }
    }
    return record;
  }
  return undefined;
};

/** Extract a string property from a Record<string, unknown>, defaulting to fallback. */
const stringProp = (obj: Record<string, unknown>, key: string, fallback: string): string => {
  const val = obj[key];
  return typeof val === 'string' ? val : fallback;
};

/** Truncate a string to MAX_BODY_LENGTH, appending a suffix if truncated. */
const truncateBody = (body: string): string =>
  body.length > MAX_BODY_LENGTH ? body.slice(0, MAX_BODY_LENGTH) + '... (truncated)' : body;

chrome.debugger.onEvent.addListener((source: chrome.debugger.Debuggee, method: string, params?: object) => {
  const p = params as Record<string, unknown> | undefined;
  const tabId = source.tabId;
  if (tabId === undefined) return;
  const state = captures.get(tabId);
  if (!state) return;

  if (method === 'Network.requestWillBeSent') {
    const requestId = p?.requestId as string | undefined;
    const request = p?.request as Record<string, unknown> | undefined;
    if (!requestId || !request) return;

    const url = stringProp(request, 'url', '');

    // Apply URL filter — skip requests that don't match
    if (state.urlFilter && !url.includes(state.urlFilter)) return;

    const postData = typeof request.postData === 'string' ? request.postData : undefined;

    state.pendingRequests.set(requestId, {
      url,
      method: stringProp(request, 'method', 'GET'),
      requestHeaders: headersToRecord(request.headers),
      requestBody: postData ? truncateBody(postData) : undefined,
      timestamp: Date.now(),
    });
  } else if (method === 'Network.responseReceived') {
    const requestId = p?.requestId as string | undefined;
    const response = p?.response as Record<string, unknown> | undefined;
    if (!requestId || !response) return;

    const pending = state.pendingRequests.get(requestId);
    if (!pending) return;

    const completed: CapturedRequest = {
      url: pending.url ?? stringProp(response, 'url', ''),
      method: pending.method ?? 'GET',
      status: typeof response.status === 'number' ? response.status : undefined,
      statusText: typeof response.statusText === 'string' ? response.statusText : undefined,
      requestHeaders: pending.requestHeaders,
      responseHeaders: headersToRecord(response.headers),
      requestBody: pending.requestBody,
      mimeType: typeof response.mimeType === 'string' ? response.mimeType : undefined,
      timestamp: pending.timestamp ?? Date.now(),
    };

    state.pendingRequests.delete(requestId);

    // Add to buffer, dropping oldest if at capacity
    if (state.requests.length >= state.maxRequests) {
      state.requests.shift();
    }
    state.requests.push(completed);
  } else if (method === 'Runtime.consoleAPICalled') {
    const type = p?.type as string | undefined;
    const args = p?.args as Array<{ type?: string; value?: unknown; description?: string }> | undefined;
    if (!type || !args) return;

    const messageParts: string[] = [];
    for (const arg of args) {
      if (arg.value !== undefined) {
        messageParts.push(typeof arg.value === 'string' ? arg.value : JSON.stringify(arg.value));
      } else if (arg.description) {
        messageParts.push(arg.description);
      } else {
        messageParts.push(arg.type ?? 'undefined');
      }
    }

    state.consoleLogs.push({
      level: type,
      message: messageParts.join(' '),
      timestamp: Date.now(),
    });
  }
});

// Clean up capture state when a tab is closed
chrome.tabs.onRemoved.addListener((tabId: number) => {
  if (captures.has(tabId)) {
    void chrome.debugger.detach({ tabId }).catch(() => {});
    captures.delete(tabId);
  }
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start capturing network requests and console logs for a tab.
 * Attaches the Chrome DevTools Protocol debugger and enables Network + Runtime domains.
 */
export const startCapture = async (tabId: number, maxRequests: number = 100, urlFilter?: string): Promise<void> => {
  if (captures.has(tabId)) {
    throw new Error(`Network capture already active for tab ${tabId}. Call stopCapture first.`);
  }

  try {
    await chrome.debugger.attach({ tabId }, '1.3');
  } catch (err) {
    throw new Error(
      `Failed to attach debugger to tab ${tabId}: ${err instanceof Error ? err.message : String(err)}. ` +
        'Another debugger (e.g., DevTools) may already be attached.',
    );
  }

  try {
    await chrome.debugger.sendCommand({ tabId }, 'Network.enable');
    await chrome.debugger.sendCommand({ tabId }, 'Runtime.enable');
  } catch (err) {
    await chrome.debugger.detach({ tabId }).catch(() => {});
    throw err;
  }

  captures.set(tabId, {
    requests: [],
    consoleLogs: [],
    maxRequests,
    urlFilter,
    pendingRequests: new Map(),
  });
};

/**
 * Stop capturing network requests and console logs for a tab.
 * Detaches the debugger and clears all buffers.
 */
export const stopCapture = (tabId: number): void => {
  const state = captures.get(tabId);
  if (!state) return;

  void chrome.debugger.detach({ tabId }).catch(() => {});
  captures.delete(tabId);
};

/**
 * Get captured network requests for a tab.
 * Optionally clears the buffer after reading.
 */
export const getRequests = (tabId: number, clear: boolean = false): CapturedRequest[] => {
  const state = captures.get(tabId);
  if (!state) return [];

  const requests = [...state.requests];
  if (clear) {
    state.requests = [];
  }
  return requests;
};

/** Check whether network capture is active for a tab. */
export const isCapturing = (tabId: number): boolean => captures.has(tabId);

/**
 * Get captured console logs for a tab.
 * Optionally filter by level and/or clear the buffer after reading.
 */
export const getConsoleLogs = (tabId: number, clear: boolean = false, level?: string): ConsoleEntry[] => {
  const state = captures.get(tabId);
  if (!state) return [];

  let logs = [...state.consoleLogs];
  if (level && level !== 'all') {
    logs = logs.filter(entry => entry.level === level);
  }
  if (clear) {
    state.consoleLogs = [];
  }
  return logs;
};

/** Clear the console log buffer for a tab without stopping capture. */
export const clearConsoleLogs = (tabId: number): void => {
  const state = captures.get(tabId);
  if (state) {
    state.consoleLogs = [];
  }
};
