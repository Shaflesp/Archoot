import type { ScreenManager } from '../ScreenManager.ts';
import type { Screen } from './Screen.ts';

export class HomeScreen implements Screen {
	element = document.getElementById('home-screen')!;

	constructor(sm: ScreenManager) {
		const buttons = this.element.querySelectorAll<HTMLAnchorElement>('.play-button');
		
		buttons.forEach((btn: HTMLAnchorElement) => {
			btn.addEventListener('click', (event: MouseEvent) => {
				event.preventDefault();
				console.log("Bouton de jeu cliqué");
				sm.show('game-screen');
			})
			// btn.addEventListener('click', (event) => {
			// event.preventDefault();
			// console.log('Bouton cliqué');
			// sm.show('game-screen');
		// });
		});
		
	}

	show(): void {
		this.element.style.display = 'flex';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
