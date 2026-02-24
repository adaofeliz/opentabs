import { mock, describe, expect, test, beforeEach } from 'bun:test';

// ---------------------------------------------------------------------------
// Module mocks — set up before importing handler modules
// ---------------------------------------------------------------------------

const mockSendToServer = mock<(data: unknown) => void>();

await mock.module('../messaging.js', () => ({
  sendToServer: mockSendToServer,
  forwardToSidePanel: mock(),
}));

await mock.module('../sanitize-error.js', () => ({
  sanitizeErrorMessage: (msg: string) => msg,
}));

await mock.module('../constants.js', () => ({
  buildWsUrl: (port: number) => `ws://localhost:${port}/ws`,
  DEFAULT_LOG_LIMIT: 100,
  DEFAULT_SERVER_PORT: 9515,
  EXEC_MAX_ASYNC_WAIT_MS: 10000,
  EXEC_POLL_INTERVAL_MS: 50,
  EXEC_RESULT_TRUNCATION_LIMIT: 50000,
  IS_READY_TIMEOUT_MS: 100,
  SCRIPT_TIMEOUT_MS: 30000,
  SERVER_PORT_KEY: 'serverPort',
  SIDE_PANEL_TIMEOUT_MS: 3000,
  WS_CONNECTED_KEY: 'wsConnected',
  WS_FLUSH_DELAY_MS: 50,
}));

await mock.module('../background-log-state.js', () => ({
  bgLogCollector: {
    getEntries: mock(() => []),
    getStats: mock(() => ({ totalCaptured: 0, bufferSize: 0, oldestTimestamp: null, newestTimestamp: null })),
  },
}));

await mock.module('../network-capture.js', () => ({
  getActiveCapturesSummary: mock(() => []),
}));

await mock.module('../plugin-storage.js', () => ({
  getAllPluginMeta: mock(() => Promise.resolve({})),
  getPluginMeta: mock(() => Promise.resolve(null)),
}));

await mock.module('../tab-matching.js', () => ({
  findAllMatchingTabs: mock(() => Promise.resolve([])),
}));

await mock.module('../tab-state.js', () => ({
  getLastKnownStates: mock(() => new Map()),
}));

// Stub chrome APIs
const mockExecuteScript = mock<(opts: unknown) => Promise<unknown[]>>().mockResolvedValue([]);
const mockSendMessage = mock<(msg: unknown) => Promise<unknown>>().mockResolvedValue(undefined);
Object.assign(globalThis, {
  chrome: {
    ...((globalThis as Record<string, unknown>).chrome as object),
    runtime: {
      id: 'test-extension-id',
      sendMessage: mockSendMessage,
      getContexts: mock(() => Promise.resolve([])),
    },
    scripting: { executeScript: mockExecuteScript },
    storage: {
      session: { get: mock(() => Promise.resolve({})) },
      local: { get: mock(() => Promise.resolve({})) },
    },
  },
});

// Import after mocking
const { handleExtensionCheckAdapter, handleBrowserExecuteScript } = await import('./extension-commands.js');

/** Extract the first argument from the first call to mockSendToServer */
const firstSentMessage = (): Record<string, unknown> => {
  const calls = mockSendToServer.mock.calls;
  expect(calls.length).toBeGreaterThanOrEqual(1);
  const firstCall = calls[0];
  if (!firstCall) throw new Error('Expected at least one call');
  return firstCall[0] as Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// handleExtensionCheckAdapter
// ---------------------------------------------------------------------------

describe('handleExtensionCheckAdapter', () => {
  beforeEach(() => {
    mockSendToServer.mockReset();
    mockExecuteScript.mockReset();
  });

  test('rejects missing plugin param', async () => {
    await handleExtensionCheckAdapter({}, 'req-1');
    expect(firstSentMessage()).toMatchObject({
      jsonrpc: '2.0',
      id: 'req-1',
      error: { code: -32602, message: 'Missing or invalid plugin parameter' },
    });
  });

  test('rejects empty plugin param', async () => {
    await handleExtensionCheckAdapter({ plugin: '' }, 'req-2');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602, message: 'Missing or invalid plugin parameter' },
    });
  });

  test('rejects non-string plugin param', async () => {
    await handleExtensionCheckAdapter({ plugin: 42 }, 'req-3');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602, message: 'Missing or invalid plugin parameter' },
    });
  });

  test('rejects unknown plugin with -32602', async () => {
    await handleExtensionCheckAdapter({ plugin: 'nonexistent' }, 'req-4');
    expect(firstSentMessage()).toMatchObject({
      jsonrpc: '2.0',
      id: 'req-4',
      error: { code: -32602, message: 'Plugin not found: "nonexistent"' },
    });
  });
});

// ---------------------------------------------------------------------------
// handleBrowserExecuteScript
// ---------------------------------------------------------------------------

describe('handleBrowserExecuteScript', () => {
  beforeEach(() => {
    mockSendToServer.mockReset();
    mockExecuteScript.mockReset();
  });

  test('rejects missing tabId', async () => {
    await handleBrowserExecuteScript({ execFile: '__exec-abc123.js' }, 'req-10');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602, message: 'Missing or invalid tabId parameter' },
    });
  });

  test('rejects missing execFile', async () => {
    await handleBrowserExecuteScript({ tabId: 1 }, 'req-11');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602, message: 'Missing or invalid execFile parameter' },
    });
  });

  test('rejects empty execFile', async () => {
    await handleBrowserExecuteScript({ tabId: 1, execFile: '' }, 'req-12');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602, message: 'Missing or invalid execFile parameter' },
    });
  });

  test('rejects non-string execFile', async () => {
    await handleBrowserExecuteScript({ tabId: 1, execFile: 123 }, 'req-13');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602 },
    });
  });

  test('rejects invalid execFile format', async () => {
    await handleBrowserExecuteScript({ tabId: 1, execFile: 'malicious.js' }, 'req-14');
    expect(firstSentMessage()).toMatchObject({
      jsonrpc: '2.0',
      id: 'req-14',
      error: { code: -32602, message: 'Invalid execFile format' },
    });
  });

  test('rejects execFile without __exec- prefix', async () => {
    await handleBrowserExecuteScript({ tabId: 1, execFile: 'script-abc123.js' }, 'req-15');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602, message: 'Invalid execFile format' },
    });
  });

  test('rejects execFile with path traversal', async () => {
    await handleBrowserExecuteScript({ tabId: 1, execFile: '../__exec-abc123.js' }, 'req-16');
    expect(firstSentMessage()).toMatchObject({
      error: { code: -32602, message: 'Invalid execFile format' },
    });
  });
});
