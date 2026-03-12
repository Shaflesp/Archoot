import type { Screen } from './Screen.ts';

export class LeaderboardScreen implements Screen {
	element = document.getElementById('leaderboard-screen')!;

	show(): void {
		this.element.style.display = 'block';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
