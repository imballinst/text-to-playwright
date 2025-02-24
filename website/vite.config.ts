import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.VITE_YAML_CONTENT = readFileSync(resolve('../assets/test/test.yaml'), 'utf-8');

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH,
  plugins: [preact(), tsconfigPaths(), ...tailwindcss()],
  resolve: {
    alias: {
      // It's kinda what it is because of the import inside import stuff.
      '@playwright/test': resolve('../src/mocks/playwright-test.ts'),
      playwright: resolve('../src/mocks/playwright.ts')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        meter: path.resolve(__dirname, 'meter/index.html')
      }
    }
  },
  define: {
    'process.env': JSON.stringify({ MOCK: true })
  }
});
