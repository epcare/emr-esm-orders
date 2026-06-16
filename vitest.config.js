import { defineConfig } from 'vitest/config';
import path from 'path';

const rootDir = path.resolve(__dirname);

export default defineConfig({
  resolve: {
    alias: {
      'workbox-window': path.resolve(rootDir, 'tools/empty-module.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    clearMocks: true,
    globals: true,
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: [path.resolve(rootDir, 'tools/setup-tests.ts')],
    server: {
      deps: {
        inline: [/@openmrs/, 'workbox-window'],
      },
    },
    alias: {
      '@openmrs/esm-framework/src/internal': '@openmrs/esm-framework/mock',
      '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
      'react-i18next': path.resolve(rootDir, '__mocks__/react-i18next.js'),
      '@mocks/': path.resolve(rootDir, '__mocks__/'),
      '@tools/': path.resolve(rootDir, 'tools/'),
    },
  },
});
