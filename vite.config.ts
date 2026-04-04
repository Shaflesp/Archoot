import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	base: '/projects/archoot-game/',
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				leaderboard: resolve(__dirname, 'pages/leaderboard.html'),
			},
		},
	},
});
