/**
 * Auth bootstrap E2E tests — verifies the extension can connect when auth.json
 * is written AFTER the extension loads, and recovers after secret rotation.
 *
 * These tests exercise the US-002 fix (re-read auth.json before every WebSocket
 * connection attempt) and the US-003 logging (console.warn on bootstrap failure).
 *
 * Both tests use custom setup (not the standard extensionContext fixture) because
 * they need fine-grained control over when auth.json exists in the extension
 * directory.
 */

import {
  test,
  expect,
  startMcpServer,
  createTestConfigDir,
  cleanupTestConfigDir,
  launchExtensionContext,
  createMcpClient,
} from './fixtures.js';
import { waitForExtensionConnected, waitForLog, setupAdapterSymlink } from './helpers.js';
import fs from 'node:fs';
import path from 'node:path';
import type { McpServer } from './fixtures.js';

test.describe('Auth bootstrap', () => {
  test('extension connects after auth.json is written post-load', async () => {
    test.slow();

    // 1. Create config dir (includes auth.json for the server) and start server
    const configDir = createTestConfigDir();
    let server: McpServer | null = null;
    let cleanupDir: string | null = null;

    try {
      server = await startMcpServer(configDir, true);

      // 2. Create extension copy WITHOUT a secret — no auth.json in extension dir
      const { context, cleanupDir: extCleanupDir, extensionDir } = await launchExtensionContext(server.port);

      cleanupDir = extCleanupDir;

      // Set up adapter symlink so the server and extension share adapter IIFEs
      setupAdapterSymlink(configDir, extensionDir);

      // DO NOT symlink auth.json — the whole point of this test is that
      // auth.json does not exist when the extension first loads.

      try {
        // 3. Wait briefly for the extension to attempt connection and fail.
        //    Without auth.json, wsSecret is null → /ws-info returns 401 → auth_failed.
        //    The extension's reconnect backoff starts at 1s.
        await new Promise(r => setTimeout(r, 3_000));

        // 4. Verify the extension is NOT connected
        const h1 = await server.health();
        expect(h1).not.toBeNull();
        if (!h1) throw new Error('health returned null');
        expect(h1.extensionConnected).toBe(false);

        // 5. Write auth.json to the extension directory with the server's secret.
        //    The extension's next connect() call will run bootstrapFromAuthFile(),
        //    pick up the secret, and authenticate successfully.
        const authJson = JSON.stringify({ secret: server.secret }) + '\n';
        fs.writeFileSync(path.join(extensionDir, 'auth.json'), authJson, 'utf-8');

        // 6. Wait for the extension to reconnect. The backoff timer will fire
        //    connect() → bootstrapFromAuthFile() reads auth.json → /ws-info
        //    succeeds → WebSocket connects. The backoff may be at 2-4s by now.
        await waitForExtensionConnected(server, 45_000);
        await waitForLog(server, 'tab.syncAll received', 15_000);

        // 7. Verify connection via /health
        const h2 = await server.health();
        expect(h2).not.toBeNull();
        if (!h2) throw new Error('health returned null');
        expect(h2.status).toBe('ok');
        expect(h2.extensionConnected).toBe(true);

        // 8. Verify tool dispatch works
        const client = createMcpClient(server.port, server.secret);
        await client.initialize();
        try {
          const result = await client.callTool('browser_list_tabs');
          expect(result.isError).toBe(false);
        } finally {
          await client.close();
        }
      } finally {
        await context.close();
      }
    } finally {
      if (server) await server.kill();
      cleanupTestConfigDir(configDir);
      if (cleanupDir) {
        try {
          fs.rmSync(cleanupDir, { recursive: true, force: true });
        } catch {
          // best-effort cleanup
        }
      }
    }
  });
});
