import { afterEach, describe, expect, test } from 'vitest';
import { getConfig } from './config.js';

const g = globalThis as Record<string, unknown>;

afterEach(() => {
  delete g.__openTabs;
});

describe('getConfig', () => {
  test('reads string value from pluginConfig', () => {
    g.__openTabs = { pluginConfig: { baseUrl: 'https://example.com' } };
    expect(getConfig('baseUrl')).toBe('https://example.com');
  });

  test('reads number value from pluginConfig', () => {
    g.__openTabs = { pluginConfig: { timeout: 30 } };
    expect(getConfig('timeout')).toBe(30);
  });

  test('reads boolean value from pluginConfig', () => {
    g.__openTabs = { pluginConfig: { verbose: true } };
    expect(getConfig('verbose')).toBe(true);
  });

  test('returns undefined for missing key', () => {
    g.__openTabs = { pluginConfig: { baseUrl: 'https://example.com' } };
    expect(getConfig('missing')).toBeUndefined();
  });

  test('returns undefined when pluginConfig is not set', () => {
    g.__openTabs = {};
    expect(getConfig('anything')).toBeUndefined();
  });

  test('returns undefined when __openTabs is not set', () => {
    expect(getConfig('anything')).toBeUndefined();
  });
});
