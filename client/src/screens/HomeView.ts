import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';

export class HomeView implements View {
	element = document.getElementById('home-screen')!;

	constructor(sm: ViewManager) {
		/* Gestion des boutons de jeu (solo/multi) */
		const buttonsPlay =
			this.element.querySelectorAll<HTMLAnchorElement>('.play-button');

		buttonsPlay.forEach((btn: HTMLAnchorElement) => {
			btn.addEventListener('click', (event: MouseEvent) => {
				event.preventDefault();
				console.log('Bouton de jeu cliqué');
				sm.show('game-screen');
			});
		});

		/* Gestion du bouton crédits */
		const buttonCredits = this.element.querySelector<HTMLAnchorElement>('.credits-button');
		buttonCredits?.addEventListener('click', (event) => {
			event.preventDefault();
			console.log('Bouton des crédits cliqué');
			sm.show('credits-screen');
		});
	}

	show(): void {
		this.element.style.display = 'flex';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
