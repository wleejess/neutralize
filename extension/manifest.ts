import { readFileSync } from 'node:fs';
import type { ManifestType } from '@extension/shared';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: '__MSG_extensionName__',
  browser_specific_settings: {
    gecko: {
      // Gecko ID — must remain consistent across all future updates.
      // This ID is embedded in the distributed .xpi and visible to anyone who inspects it.
      id: 'neutralize@wleejess.github.io',
      strict_min_version: '109.0',
    },
  },
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'",
  },
  host_permissions: ['<all_urls>'],
  permissions: ['storage', 'scripting', 'tabs', 'notifications', 'sidePanel', 'webNavigation'],
  options_page: 'options/index.html',
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_icon: {
      '16': 'icon-16.png',
      '32': 'icon-32.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png',
    },
  },
  icons: {
    '16': 'icon-16.png',
    '32': 'icon-32.png',
    '48': 'icon-48.png',
    '128': 'icon-128.png',
    '512': 'icon-512.png',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content/all.iife.js'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.svg', '*.png'],
      matches: ['*://*/*'],
    },
  ],
  side_panel: {
    default_path: 'side-panel/index.html',
  },
} satisfies ManifestType;

export default manifest;
