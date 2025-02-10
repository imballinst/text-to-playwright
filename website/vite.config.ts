import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), tsconfigPaths(), ...tailwindcss()],
  resolve: {
    alias: {
      // It's kinda what it is because of the import inside import stuff.
      '@playwright/test': resolve('../src/mocks/playwright-test.ts'),
      playwright: resolve('../src/mocks/playwright.ts')
    }
  }
});
