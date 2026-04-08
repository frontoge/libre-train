import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config([
	globalIgnores(['dist']),
	{
		files: ['**/*.ts'],
		ignores: ['generated'],
		extends: [js.configs.recommended, tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.node,
			parserOptions: {
				project: true,
				tsconfigRootDir: __dirname,
			},
		},
	},
]);
