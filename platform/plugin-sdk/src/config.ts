/**
 * Plugin configuration accessor.
 * Reads resolved settings injected by the adapter IIFE at runtime.
 * Returns undefined when no config is available (tests, unconfigured plugins).
 */
export const getConfig = (key: string): string | number | boolean | undefined => {
  const ot = (globalThis as Record<string, unknown>).__openTabs as Record<string, unknown> | undefined;
  const config = ot?.pluginConfig as Record<string, string | number | boolean> | undefined;
  return config?.[key];
};
