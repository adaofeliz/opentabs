/**
 * Side panel menu version item E2E tests.
 *
 * Verifies:
 *   1. Local plugin version item: FolderOpen icon, correct version text,
 *      not disabled, remove item says "Remove" with top border separator
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  cleanupTestConfigDir,
  E2E_TEST_PLUGIN_DIR,
  expect,
  launchExtensionContext,
  startMcpServer,
  startTestServer,
  test,
  writeTestConfig,
} from './fixtures.js';
import {
  openSidePanel,
  openTestAppTab,
  setupAdapterSymlink,
  waitForExtensionConnected,
  waitForLog,
} from './helpers.js';

/** Read the e2e-test plugin's package name and version from its package.json. */
const getPluginPackageInfo = (): { name: string; version: string } => {
  const pkg = JSON.parse(fs.readFileSync(path.join(E2E_TEST_PLUGIN_DIR, 'package.json'), 'utf-8')) as {
    name: string;
    version: string;
  };
  return { name: pkg.name, version: pkg.version };
};

test.describe('Side panel — menu version items', () => {
  test('local plugin version item shows FolderOpen icon, correct version, and Remove with border', async () => {
    const absPluginPath = path.resolve(E2E_TEST_PLUGIN_DIR);
    const { version } = getPluginPackageInfo();

    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opentabs-e2e-menu-version-'));
    writeTestConfig(configDir, {
      localPlugins: [absPluginPath],
      permissions: { 'e2e-test': { permission: 'auto' } },
    });

    const server = await startMcpServer(configDir, true);
    const testServer = await startTestServer();
    const { context, cleanupDir, extensionDir } = await launchExtensionContext(server.port, server.secret);
    setupAdapterSymlink(configDir, extensionDir);

    try {
      await waitForExtensionConnected(server);
      await waitForLog(server, 'tab.syncAll received', 15_000);

      await openTestAppTab(context, testServer.url, server, testServer);
      const sidePanelPage = await openSidePanel(context);

      // Wait for the plugin card to appear
      await expect(sidePanelPage.getByText('E2E Test')).toBeVisible({ timeout: 30_000 });

      // Open the plugin three-dot menu
      const menuButton = sidePanelPage.locator('[aria-label="Plugin options"]');
      await expect(menuButton).toBeVisible();
      await menuButton.click();

      // --- Version item assertions ---

      // Version item shows the correct version text
      const versionItem = sidePanelPage.locator('[role="menuitem"]', { hasText: `v${version}` });
      await expect(versionItem).toBeVisible({ timeout: 5_000 });

      // Version item contains a FolderOpen icon (lucide adds "lucide-folder-open" class)
      const folderOpenIcon = versionItem.locator('svg.lucide-folder-open');
      await expect(folderOpenIcon).toBeVisible();

      // Version item does NOT contain a Package icon
      const packageIcon = versionItem.locator('svg.lucide-package');
      await expect(packageIcon).not.toBeVisible();

      // Version item is not disabled (no data-disabled attribute)
      await expect(versionItem).not.toHaveAttribute('data-disabled');

      // --- Remove item assertions ---

      // Remove item says "Remove" (not "Uninstall") for local plugins
      const removeItem = sidePanelPage.locator('[role="menuitem"]', { hasText: 'Remove' });
      await expect(removeItem).toBeVisible();

      // The Remove item should NOT say "Uninstall"
      const uninstallItem = sidePanelPage.locator('[role="menuitem"]', { hasText: 'Uninstall' });
      await expect(uninstallItem).not.toBeVisible();

      // The destructive Remove item has a top border separator (border-t class)
      await expect(removeItem).toHaveClass(/border-t/);
    } finally {
      await context.close();
      await server.kill();
      await testServer.kill();
      cleanupTestConfigDir(configDir);
      if (cleanupDir) fs.rmSync(cleanupDir, { recursive: true, force: true });
    }
  });
});
