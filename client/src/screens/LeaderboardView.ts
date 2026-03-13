import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';

export class LeaderboardView implements View {
	element = document.getElementById('leaderboard-screen')!;

	constructor(sm: ViewManager) {}

	show(): void {
		this.element.style.display = 'flex';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
