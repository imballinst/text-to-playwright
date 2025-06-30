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

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ?? '',
  plugins: [react(), tsconfigPaths(), ...tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        meter: path.resolve(__dirname, 'meter/index.html'),
        'template-crud': path.resolve(__dirname, 'template-crud/index.html'),
        'pricing-package': path.resolve(__dirname, 'pricing-package/index.html')
      }
    }
  }
});
