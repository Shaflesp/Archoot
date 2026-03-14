import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import { Socket } from 'socket.io-client';

export class HomeView implements View {

	element = document.getElementById('home-screen')!;

	constructor(sm: ViewManager, socket: Socket) {
		/* Gestion des boutons de jeu (solo/multi) */
		const buttonsPlay =
			this.element.querySelectorAll<HTMLAnchorElement>('.play-button');

		buttonsPlay.forEach((btn: HTMLAnchorElement) => {
			btn.addEventListener('click', (event: MouseEvent) => {
				event.preventDefault();

				const pseudoInput = document.getElementById(
					'pseudo'
				) as HTMLInputElement;
				const username = pseudoInput.value.trim();

				if (username.length < 2) {
					return;
				}

				socket.emit('register', { username });

				console.log('Bouton de jeu cliqué');
				sm.show('game-screen');
			});
		});

		/* Gestion du bouton crédits */
		const buttonCredits =
			this.element.querySelector<HTMLAnchorElement>('.credits-button');
		buttonCredits?.addEventListener('click', event => {
			event.preventDefault();
			console.log('Bouton des crédits cliqué');
			sm.show('credits-screen');
		});

		/* Gestion du bouton leaderboard */
		const buttonLeaderBoard = this.element.querySelector<HTMLAnchorElement>(
			'.leaderboard-button'
		);
		buttonLeaderBoard?.addEventListener('click', event => {
			event.preventDefault();
			console.log('Bouton du leaderboard cliqué');
			sm.show('leaderboard-screen');
		});
	}

	show(): void {
		this.element.style.display = 'flex';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
