import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		include: ['tests/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.tsx']
	},
	resolve: {
		alias: {
			'@renderer': resolve(__dirname, './src/renderer'),
			'@common': resolve(__dirname, './src/common'),
			'@hooks': resolve(__dirname, './src/renderer/hooks'),
			'@reducers': resolve(__dirname, './src/renderer/reducers')
		}
	}
});
