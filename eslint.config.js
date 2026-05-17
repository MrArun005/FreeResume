import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist', 'node_modules', 'server/node_modules']),
    {
        files: ['src/**/*.{js,jsx}'],
        plugins: { react },
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            // Must be last so Prettier's "disable rules that conflict with formatting"
            // overrides anything in the recommended sets.
            prettier,
        ],
        settings: { react: { version: 'detect' } },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
            // Only enable the JSX usage-tracking rule; don't pull in the full react-recommended set.
            'react/jsx-uses-vars': 'error',
            'react/jsx-uses-react': 'off',
        },
    },
    {
        // TypeScript / TSX — same React + hooks rules, but parsed by the TS parser
        // so type annotations don't trip the JS parser.
        files: ['src/**/*.{ts,tsx}'],
        plugins: { react, '@typescript-eslint': tseslint.plugin },
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            prettier,
        ],
        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: 'detect' } },
        rules: {
            // TS handles unused-vars far better than ESLint's core rule for ts files.
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
            'react/jsx-uses-vars': 'error',
            'react/jsx-uses-react': 'off',
        },
    },
    {
        // Node-side code: serverless API handlers, local Express server, test scripts.
        files: ['api/**/*.js', 'server/**/*.js', 'test-*.js', '*.config.js'],
        extends: [js.configs.recommended, prettier],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.node },
        },
        rules: {
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },
]);
