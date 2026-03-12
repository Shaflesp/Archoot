import type { ScreenManager } from '../ScreenManager.ts';
import type { Screen } from './Screen.ts';

export class GameScreen implements Screen {
	element = document.getElementById('game-screen')!;

	constructor(sm: ScreenManager) {}

	show(): void {
		console.log("GameScreen appelé");
		this.element.style.display = 'flex';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
