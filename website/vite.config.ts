import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.VITE_YAML_CONTENT = readFileSync(resolve('../assets/test/test.yaml'), 'utf-8');

const VITE_APP_INPUTS = {
  meter: path.resolve(__dirname, 'meter/index.html'),
  'template-crud': path.resolve(__dirname, 'template-crud/index.html'),
  'pricing-package': path.resolve(__dirname, 'pricing-package/index.html'),
  table: path.resolve(__dirname, 'table/index.html')
};
const VITE_APP_INPUTS_TO_TITLE: Record<keyof typeof VITE_APP_INPUTS, string> = {
  meter: 'DPS Meter',
  'template-crud': 'Template CRUD',
  'pricing-package': 'Pricing Package',
  table: 'Table Example'
};

process.env.VITE_APP_INPUTS = Object.entries(VITE_APP_INPUTS_TO_TITLE).join(';');
process.env.VITE_BASE_PATH = process.env.VITE_BASE_PATH ?? '';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH,
  plugins: [react(), tsconfigPaths(), ...tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ...VITE_APP_INPUTS
      }
    }
  }
});
