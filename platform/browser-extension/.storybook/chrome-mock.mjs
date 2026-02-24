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

if (typeof globalThis.chrome === 'undefined') {
  globalThis.chrome = {
    storage: {
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
    },
    runtime: {
      sendMessage: () => Promise.resolve(),
      onMessage: makeListenerHub(),
      lastError: null,
    },
  };
}
