/**
 * E2E tests for the plugin logging pipeline.
 *
 * Verifies the full flow: sdk.log in adapter → postMessage → ISOLATED relay →
 * chrome.runtime.sendMessage → background → WebSocket → MCP server → log buffer
 * → console (server.log) → MCP clients (sendLoggingMessage).
 *
 * Uses the e2e-test plugin's `log_levels` tool, which emits one log entry at
 * each level (debug, info, warning, error) with a unique prefix for isolation.
 */

import { test, expect } from './fixtures.js';
import { setupToolTest, callToolExpectSuccess, waitForLog } from './helpers.js';

test.describe('Plugin logging — full pipeline', () => {
  test('log_levels tool emits log entries that arrive at MCP server', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    const prefix = `e2e-log-${Date.now()}`;
    const output = await callToolExpectSuccess(mcpClient, mcpServer, 'e2e-test_log_levels', { prefix });
    expect(output.ok).toBe(true);
    expect(output.levels).toEqual(['debug', 'info', 'warning', 'error']);

    // Wait for log entries to propagate through the pipeline (batched every 100ms,
    // then relayed via WebSocket, then processed by MCP server)
    await waitForLog(mcpServer, `${prefix} error-message`, 15_000);

    // Verify all four log levels appeared in server logs
    const allLogs = mcpServer.logs.join('\n');
    expect(allLogs).toContain(`[plugin:e2e-test]`);
    expect(allLogs).toContain(`${prefix} debug-message`);
    expect(allLogs).toContain(`${prefix} info-message`);
    expect(allLogs).toContain(`${prefix} warning-message`);
    expect(allLogs).toContain(`${prefix} error-message`);

    // Verify log level tags appear in server log output
    expect(allLogs).toContain('DEBUG');
    expect(allLogs).toContain('INFO');
    expect(allLogs).toContain('WARNING');
    expect(allLogs).toContain('ERROR');

    await page.close();
  });
});
