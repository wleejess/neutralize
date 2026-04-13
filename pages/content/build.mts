import { resolve } from 'node:path';
import { makeEntryPointPlugin } from '@extension/hmr';
import { getContentScriptEntries, withPageConfig } from '@extension/vite-config';
import { IS_DEV, DIST_DIR } from '@extension/env';
import { build } from 'vite';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');
const matchesDir = resolve(srcDir, 'matches');

const configs = Object.entries(getContentScriptEntries(matchesDir)).map(([name, entry]) =>
  withPageConfig({
    mode: IS_DEV ? 'development' : undefined,
    resolve: {
      alias: {
        '@src': srcDir,
      },
    },
    publicDir: resolve(rootDir, 'public'),
    plugins: [IS_DEV && makeEntryPointPlugin()],
    build: {
      lib: {
        name: name,
        formats: ['iife'],
        entry,
        fileName: name,
      },
      outDir: resolve(rootDir, '..', '..', DIST_DIR, 'content'),
    },
  }),
);

for (const [i, config] of configs.entries()) {
  //@ts-expect-error This is hidden property into vite's resolveConfig()
  config.configFile = false;
  if (i > 0) {
    // Prevent later builds from wiping files written by earlier builds into the shared outDir
    config.build = { ...config.build, emptyOutDir: false };
  }
  await build(config);
}
