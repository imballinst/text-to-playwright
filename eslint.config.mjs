import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/mocks/*']
        }
      ],
      '@typescript-eslint/no-explicit-any': [
        'off',
        {
          patterns: ['**/mocks/*']
        }
      ],
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  }
];
