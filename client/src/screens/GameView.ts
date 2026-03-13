import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';

export class GameView implements View {
	element = document.getElementById('game-screen')!;

	constructor(sm: ViewManager) {}

	show(): void {
		console.log('GameScreen appelé');
		this.element.style.display = 'flex';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
