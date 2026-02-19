export const KEEPALIVE_ALARM = 'opentabs-keepalive';
export const KEEPALIVE_INTERVAL_MINUTES = 0.5; // Chrome 120+ supports 30-second alarm periods; older versions require 1 minute minimum
export const PLUGINS_META_KEY = 'plugins_meta';
export const WS_CONNECTED_KEY = 'wsConnected';
/**
 * Timeout for chrome.scripting.executeScript calls (ms).
 *
 * Set to 25 seconds — 5 seconds less than the MCP server's DISPATCH_TIMEOUT_MS
 * (30 seconds in platform/mcp-server/src/state.ts). This guarantees the extension
 * sends a response (success or timeout error) before the server gives up and
 * discards the pending dispatch, preventing orphaned script executions whose
 * results are silently dropped.
 */
export const SCRIPT_TIMEOUT_MS = 25_000;
/**
 * Timeout for isReady() probes during tab state computation (ms).
 *
 * Caps how long computePluginTabState waits for an adapter's isReady()
 * response. If the probe doesn't return within this window, the tab is
 * reported as "unavailable" rather than blocking state computation.
 */
export const IS_READY_TIMEOUT_MS = 5_000;
/** Delay before chrome.runtime.reload() to allow the WebSocket response to flush */
export const RELOAD_FLUSH_DELAY_MS = 100;
/** Matches lowercase alphanumeric plugin names with optional hyphen separators (e.g., "slack", "e2e-test") */
export const VALID_PLUGIN_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Validate a plugin name against the expected format */
export const isValidPluginName = (name: string): boolean => VALID_PLUGIN_NAME.test(name);
