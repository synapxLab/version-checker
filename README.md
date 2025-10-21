# @synapxlab/version-checker

> Lightweight browser version checker with smart sampling and privacy-first design

[![npm version](https://img.shields.io/npm/v/@synapxlab/version-checker.svg)](https://www.npmjs.com/package/@synapxlab/version-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🪶 **Lightweight** - ~1KB minified, zero dependencies
- 🎯 **Smart sampling** - Configurable execution probability (default 10%)
- ⚡ **Idle execution** - Uses `requestIdleCallback` for non-blocking checks
- 🔒 **Privacy-first** - No tracking, no cookies, no personal data
- 🚫 **Auto-abort** - Cancels on page unload or tab hidden
- 📦 **NPM registry** - Uses official npm API, no custom server needed
- 🌐 **Browser-native** - Modern fetch API with AbortController

## Installation

```bash
npm install @synapxlab/version-checker
```

## Usage

### Basic

```javascript
import { checkVersion } from '@synapxlab/version-checker';

checkVersion({
  currentVersion: '2.4.0',
  packageName: '@synapxlab/cookie-consent'
});
```

### Custom callbacks

```javascript
checkVersion({
  currentVersion: '2.4.0',
  packageName: '@synapxlab/cookie-consent',
  delay: 5000,
  chance: 0.20,
  onUpdate: (latest, current) => {
    alert(`New version ${latest} available! You're on ${current}`);
  },
  onUnsupported: (latest, current) => {
    console.error(`Version ${current} is deprecated. Upgrade to ${latest}`);
  }
});
```

### Silent mode

```javascript
checkVersion({
  currentVersion: '2.4.0',
  packageName: '@synapxlab/cookie-consent',
  silent: true,
  onUpdate: (latest) => {
    // Custom notification logic
    showUpdateBanner(latest);
  }
});
```

### Inline (no build step)

```html
<script type="module">
  import { checkVersion } from 'https://unpkg.com/@synapxlab/version-checker';
  
  checkVersion({
    currentVersion: '2.4.0',
    packageName: '@synapxlab/cookie-consent'
  });
</script>
```

## API

### `checkVersion(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `currentVersion` | `string` | **required** | Current package version (e.g., `"2.4.0"`) |
| `packageName` | `string` | **required** | NPM package name (e.g., `"@org/package"`) |
| `delay` | `number` | `10000` | Delay before check (ms) |
| `chance` | `number` | `0.10` | Execution probability (0-1) |
| `onUpdate` | `function` | `null` | Callback: `(latest, current) => void` |
| `onUnsupported` | `function` | `null` | Callback: `(latest, current) => void` |
| `onError` | `function` | `null` | Callback: `(error) => void` |
| `silent` | `boolean` | `false` | Suppress console messages |

### `compareVersions(v1, v2)`

Compare two semver versions.

```javascript
import { compareVersions } from '@synapxlab/version-checker';

compareVersions('2.4.0', '2.5.0'); // -1 (v1 < v2)
compareVersions('2.4.0', '2.4.0'); // 0  (equal)
compareVersions('2.5.0', '2.4.0'); // 1  (v1 > v2)
```

## How it works

1. **Wait** - Delays execution by 10s (configurable)
2. **Sample** - Random check: only 10% of page loads execute (configurable)
3. **Idle** - Uses `requestIdleCallback` to avoid blocking the main thread
4. **Fetch** - Queries npm registry: `https://registry.npmjs.org/{package}/latest`
5. **Compare** - Semver comparison between current and latest
6. **Notify** - Console message or custom callback

## Cancellation

The check is automatically cancelled if:

- User closes/reloads the page (`beforeunload` event)
- Tab becomes inactive (`visibilitychange` event)

This prevents unnecessary network requests and respects user bandwidth.

## Console messages

### Update available
```
ℹ️ @synapxlab/cookie-consent: v2.4.0 → v2.5.0 available
```

### Version not supported
```
⚠️ @synapxlab/cookie-consent: v2.4.0 not supported → v3.0.0
```

Use `silent: true` to suppress these messages.

## Privacy & GDPR

- ✅ No personal data collected
- ✅ No cookies or localStorage
- ✅ No IP addresses stored
- ✅ No user tracking
- ✅ Simple GET request to npm registry

**GDPR compliance:** No consent required (legitimate interest: security updates)

## Browser support

- Chrome/Edge 47+
- Firefox 55+
- Safari 11.1+
- Any browser with `fetch` and `AbortController`

## License

MIT © [SynapxLab](https://github.com/synapxlab)

## Contributing

Pull requests welcome! Please open an issue first to discuss changes.

## Related

- [@synapxlab/cookie-consent](https://www.npmjs.com/package/@synapxlab/cookie-consent) - The cookie consent SDK using this checker