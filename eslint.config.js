import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const reactFiles = ['src/**/*.{js,jsx,ts,tsx}'];
const tsFiles = ['src/**/*.{ts,tsx}'];
const reactRecommended = reactPlugin.configs.flat.recommended;
const reactJsxRuntime = reactPlugin.configs.flat['jsx-runtime'];
const typeAwareConfigs = [
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
].map((config) => ({
  ...config,
  files: tsFiles,
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
}));

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...typeAwareConfigs,
  {
    files: reactFiles,
    ...reactRecommended,
    ...reactJsxRuntime,
    languageOptions: {
      ...reactRecommended.languageOptions,
      ...reactJsxRuntime.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      ...reactRecommended.plugins,
      ...reactJsxRuntime.plugins,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      ...reactRecommended.settings,
      ...reactJsxRuntime.settings,
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactRecommended.rules,
      ...reactJsxRuntime.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['coerce', 'ternary'] }],
    },
  },
  eslintConfigPrettier,
];
