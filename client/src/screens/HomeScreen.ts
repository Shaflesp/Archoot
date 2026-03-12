import type { ScreenManager } from '../ScreenManager.ts';
import type { Screen } from './Screen.ts';

export class HomeScreen implements Screen {
	element = document.getElementById('home-screen')!;

	constructor(sm: ScreenManager) {
		document.querySelector('.bottom-menu .play-button')?.addEventListener('click', () => {
			console.log('correct');
			sm.show('game-screen');
		});
	}

	show(): void {
		this.element.style.display = 'block';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
