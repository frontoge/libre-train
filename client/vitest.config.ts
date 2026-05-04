import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],

	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		exclude: ['**/dist/**', '**/node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
		},
	},

	resolve: {
		alias: {
			'@libre-train/shared': path.resolve(__dirname, '../shared'),
			'@libre-train/db/zod': path.resolve(__dirname, 'src/test/__mocks__/db-zod.ts'),
			'@libre-train/db/client': path.resolve(__dirname, 'src/test/__mocks__/db-client.ts'),
		},
	},
});
