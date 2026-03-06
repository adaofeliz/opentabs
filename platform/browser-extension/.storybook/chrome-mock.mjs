/**
 * Minimal mock of the Chrome extension APIs used by side panel components.
 *
 * Storybook runs in a regular browser context where `chrome.storage`,
 * `chrome.runtime`, etc. do not exist. This mock provides no-op
 * implementations so components render without errors. It is loaded in
 * preview.tsx before any story mounts.
 */

function makeListenerHub() {
  const listeners = new Set();
  return {
    addListener: fn => listeners.add(fn),
    removeListener: fn => listeners.delete(fn),
    hasListener: fn => listeners.has(fn),
  };
}

const store = {};

const storageMock = {
  local: {
    get: keys => {
      const result = {};
      const keyList = typeof keys === 'string' ? [keys] : keys;
      for (const k of keyList) {
        if (k in store) result[k] = store[k];
      }
      return Promise.resolve(result);
    },
    set: items => {
      Object.assign(store, items);
      return Promise.resolve();
    },
    remove: keys => {
      const keyList = typeof keys === 'string' ? [keys] : keys;
      for (const k of keyList) delete store[k];
      return Promise.resolve();
    },
  },
  onChanged: makeListenerHub(),
};

const runtimeMock = {
  sendMessage: () => Promise.resolve(),
  onMessage: makeListenerHub(),
  lastError: null,
};

// In Chrome browsers, `globalThis.chrome` exists but without extension APIs
// like `chrome.storage`. Patch the existing object rather than replacing it
// so the mock works in both Chrome and non-Chrome browsers.
if (typeof globalThis.chrome === 'undefined') {
  globalThis.chrome = {};
}

const sessionStore = {};

const sessionStorageMock = {
  get: keys => {
    const result = {};
    const keyList = typeof keys === 'string' ? [keys] : keys;
    for (const k of keyList) {
      if (k in sessionStore) result[k] = sessionStore[k];
    }
    return Promise.resolve(result);
  },
  set: items => {
    Object.assign(sessionStore, items);
    return Promise.resolve();
  },
  remove: keys => {
    const keyList = typeof keys === 'string' ? [keys] : keys;
    for (const k of keyList) delete sessionStore[k];
    return Promise.resolve();
  },
};

globalThis.chrome.storage ??= storageMock;
globalThis.chrome.storage.local ??= storageMock.local;
globalThis.chrome.storage.session ??= sessionStorageMock;
globalThis.chrome.storage.onChanged ??= storageMock.onChanged;
globalThis.chrome.runtime ??= runtimeMock;
