/**
 * @synapxlab/version-checker
 * Lightweight browser version checker with smart sampling
 * MIT License
 */

/**
 * Compares two semver versions (x.y.z)
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const toNum = (s) => {
    const m = String(s || '').match(/^\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };
  const [a = 0, b = 0, c = 0] = String(v1).split('.').map(toNum);
  const [x = 0, y = 0, z = 0] = String(v2).split('.').map(toNum);
  return (a - x) || (b - y) || (c - z);
}

/**
 * Check for package version updates
 * @param {Object} options - Configuration options
 * @param {string} options.currentVersion - Current package version (e.g., "2.4.0")
 * @param {string} options.packageName - NPM package name (e.g., "@synapxlab/cookie-consent")
 * @param {number} [options.delay=10000] - Delay before check in milliseconds
 * @param {number} [options.chance=0.10] - Probability of execution (0-1)
 * @param {Function} [options.onUpdate] - Callback when update available (latest) => void
 * @param {Function} [options.onUnsupported] - Callback when version unsupported (latest) => void
 * @param {Function} [options.onError] - Callback on error (error) => void
 * @param {boolean} [options.silent=false] - Suppress console messages
 */
export function checkVersion(options = {}) {
  const {
    currentVersion,
    packageName,
    delay = 10_000,
    chance = 0.10,
    onUpdate,
    onUnsupported,
    onError,
    silent = false
  } = options;

  if (!currentVersion || !packageName) {
    throw new Error('currentVersion and packageName are required');
  }

  const registryUrl = `https://registry.npmjs.org/${packageName}/latest`;
  const ctrl = new AbortController();
  const signal = ctrl.signal;

  // Auto-abort on page unload
  addEventListener('beforeunload', () => ctrl.abort(), { once: true });

  // Auto-abort when tab becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') ctrl.abort();
  });

  setTimeout(() => {
    // Use requestIdleCallback or fallback to setTimeout
    (window.requestIdleCallback || function (cb) { setTimeout(cb, 100); })(() => {
      // Check if already aborted
      if (signal.aborted) return;

      // Random sampling
      if (Math.random() > chance) return;

      fetch(registryUrl, {
        method: 'GET',
        cache: 'no-store',
        signal
      })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
        .then(data => {
          const latest = data && data.version;
          if (!latest) return;

          const diff = compareVersions(currentVersion, latest);

          // Version is outdated
          if (diff < 0) {
            if (onUpdate) {
              onUpdate(latest, currentVersion);
            } else if (!silent) {
              console.info(`ℹ️ ${packageName}: v${currentVersion} → v${latest} available`);
            }
          }

          // Check for min_supported if provided (custom field)
          const minSupported = data.minSupported || data.min_supported;
          if (minSupported && compareVersions(currentVersion, minSupported) < 0) {
            if (onUnsupported) {
              onUnsupported(latest, currentVersion);
            } else if (!silent) {
              console.warn(`⚠️ ${packageName}: v${currentVersion} not supported → v${latest}`);
            }
          }
        })
        .catch(err => {
          if (err.name === 'AbortError') return; // Normal abort, silent
          if (onError) {
            onError(err);
          }
          // Silent by default on network errors
        });
    });
  }, delay);
}

export { compareVersions };