import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['**/dist/**', '**/build/**', '**/node_modules/**', '**/*.d.ts']),
	{
		files: ['./src/**/*.{ts,tsx}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.browser },
	},
	tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
	},
	pluginReact.configs.flat.recommended,
	{
		rules: {
			'react/react-in-jsx-scope': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-deprecated': 'warn',
			'semi': ['warn', 'always'],
		},
	},
]);
