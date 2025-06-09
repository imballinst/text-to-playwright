import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'text-to-playwright': 'src/index.ts'
  },
  format: ['esm'],
  external: ['playwright-core'],
  clean: true
});
