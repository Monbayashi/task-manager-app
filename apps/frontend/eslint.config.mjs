import { nextJsConfig } from '@repo/eslint-config/next-js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    ignores: ['dist/**', '.prettierrc.mjs', 'eslint.config.mjs', 'jest.config.js'],
  },
];
