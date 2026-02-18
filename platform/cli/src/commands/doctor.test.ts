import { checkBunVersion, checkExtensionConnected } from './doctor.js';
import { describe, expect, test } from 'bun:test';
import type { CheckResult } from './doctor.js';

// ---------------------------------------------------------------------------
// checkExtensionConnected
// ---------------------------------------------------------------------------

describe('checkExtensionConnected', () => {
  test('returns warn result when health data is null', () => {
    const result: CheckResult = checkExtensionConnected(null);
    expect(result.ok).toBe(false);
    expect(result.fatal).toBe(false);
    expect(result.label).toBe('Extension connection');
    expect(result.detail).toContain('unknown');
  });

  test('returns pass result when extensionConnected is true', () => {
    const result: CheckResult = checkExtensionConnected({ extensionConnected: true });
    expect(result.ok).toBe(true);
    expect(result.label).toBe('Extension connection');
    expect(result.detail).toBe('connected');
  });

  test('returns warn result when extensionConnected is false', () => {
    const result: CheckResult = checkExtensionConnected({ extensionConnected: false });
    expect(result.ok).toBe(false);
    expect(result.fatal).toBe(false);
    expect(result.label).toBe('Extension connection');
    expect(result.detail).toContain('not connected');
    expect(result.hint).toBeDefined();
  });

  test('returns warn result when extensionConnected is missing', () => {
    const result: CheckResult = checkExtensionConnected({ version: '1.0.0' });
    expect(result.ok).toBe(false);
    expect(result.fatal).toBe(false);
    expect(result.detail).toContain('not connected');
  });
});

// ---------------------------------------------------------------------------
// checkBunVersion
// ---------------------------------------------------------------------------

describe('checkBunVersion', () => {
  test('returns pass result with current Bun version', () => {
    const result: CheckResult = checkBunVersion();
    expect(result.ok).toBe(true);
    expect(result.label).toBe('Bun runtime');
    expect(result.detail).toContain(Bun.version);
  });
});
