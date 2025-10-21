import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkVersion, compareVersions } from '../src/index.js';

describe('compareVersions', () => {
  it('should return -1 when v1 < v2', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
    expect(compareVersions('2.4.0', '2.5.0')).toBe(-1);
  });

  it('should return 0 when versions are equal', () => {
    expect(compareVersions('2.4.0', '2.4.0')).toBe(0);
  });

  it('should return 1 when v1 > v2', () => {
    expect(compareVersions('3.0.0', '2.0.0')).toBe(1);
    expect(compareVersions('2.5.0', '2.4.0')).toBe(1);
  });

  it('should handle malformed versions', () => {
    expect(compareVersions('2.x.0', '2.0.0')).toBe(0);
    // expect(compareVersions('v2.4.0', '2.4.0')).toBe(0);
  });
});

describe('checkVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.addEventListener = vi.fn();
    global.document = {
      addEventListener: vi.fn(),
      visibilityState: 'visible'
    };
    global.window = {
      requestIdleCallback: vi.fn(cb => setTimeout(cb, 0))
    };
  });

  it('should throw error when missing required params', () => {
    expect(() => checkVersion({})).toThrow('currentVersion and packageName are required');
  });

it('should fetch version from npm registry', async () => {
  const mockResponse = { version: '2.5.0' };
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => mockResponse
  });

  const consoleInfo = vi.spyOn(console, 'info').mockImplementation();
  
  checkVersion({
    currentVersion: '2.4.0',
    packageName: '@synapxlab/test',
    delay: 0,
    chance: 1  // ✅ Était "f1"
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  expect(fetch).toHaveBeenCalledWith(
    'https://registry.npmjs.org/@synapxlab/test/latest',
    expect.any(Object)
  );

  consoleInfo.mockRestore();
});

  it('should call onUpdate callback when update available', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ version: '2.5.0' })
    });

    const onUpdate = vi.fn();
    
    checkVersion({
      currentVersion: '2.4.0',
      packageName: '@synapxlab/test',
      delay: 0,
      chance: 1,
      onUpdate,
      silent: true
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onUpdate).toHaveBeenCalledWith('2.5.0', '2.4.0');
  });

  it('should not execute when chance is 0', async () => {
    global.fetch = vi.fn();
    
    checkVersion({
      currentVersion: '2.4.0',
      packageName: '@synapxlab/test',
      delay: 0,
      chance: 0
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(fetch).not.toHaveBeenCalled();
  });
});