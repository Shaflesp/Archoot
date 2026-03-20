import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import type { Socket } from 'socket.io-client';

export class HomeView implements View {
	socket: Socket;
	sm: ViewManager;

	element = document.getElementById('home-screen')!;
	pseudoInput = document.getElementById('pseudo') as HTMLInputElement;

	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;

		/* Gestion des boutons de jeu (solo/multi) */
		const buttonsPlay =
			this.element.querySelectorAll<HTMLAnchorElement>('.play-button');

		buttonsPlay.forEach((btn: HTMLAnchorElement) => {
			btn.addEventListener('click', (event: MouseEvent) => {
				event.preventDefault();

				const username = this.pseudoInput.value.trim();

				if (username.length < 2) {
					alert('Votre pseudonyme est trop court!');
					return;
				}
				socket.emit('register', { username });
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
		this.socket.on('register_success', this.onRegisterSuccess);
		this.socket.on('register_error', this.onRegisterError);
	}

	hide(): void {
		this.element.style.display = 'none';
		this.socket.off('register_success', this.onRegisterSuccess);
		this.socket.off('register_error', this.onRegisterError);
	}

	private onRegisterSuccess = () => {
		this.sm.show('game-screen');
	};

	private onRegisterError = (message: string) => {
		console.error('Registration failed:', message);
	};
}
