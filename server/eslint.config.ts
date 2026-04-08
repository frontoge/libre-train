import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
	globalIgnores(['**/dist/**', '**/build/**', '**/node_modules/**', '**/*.d.ts']),
	tseslint.configs.recommendedTypeChecked,
	{
		files: ['**/*.ts'],
		ignores: ['dist/**', 'build/**'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.node,
			parserOptions: {
				project: true,
				tsconfigRootDir: __dirname,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		rules: {
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-deprecated': 'warn',
			'semi': ['warn', 'always'],
		},
	},
	{
		files: ['**/*.test.ts', '**/*.spec.ts'],
		rules: {
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
		},
	},
]);
