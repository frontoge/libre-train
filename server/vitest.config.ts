import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['test/**/*.{test,spec}.{ts,tsx}'],
		exclude: ['**/dist/**', '**/node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
		},
	},

	resolve: {
		alias: {
			'@libre-train/shared': '../shared',
		},
	},
});
