import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import type { Socket } from 'socket.io-client';
import { Popup } from './Popup.ts';

export class HomeView implements View {
	socket: Socket;
	sm: ViewManager;

	element = document.getElementById('home-screen')!;
	pseudoInput = document.getElementById('pseudo') as HTMLInputElement;
	usernamePopup = new Popup('.username');
	takenPopup = new Popup('.taken');

	private pendingDestination: string | null = null;

	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;

		/* Gestion des boutons de jeu (solo/multi) */
		const buttonSingleplayer =
			this.element.querySelector<HTMLElement>('.play-button-solo')!;

		buttonSingleplayer.addEventListener('click', (event: MouseEvent) => {
			event.preventDefault();

			const username = this.pseudoInput.value.trim();
			if (username.length < 2) {
				this.usernamePopup.show();
				return;
			}

			this.pendingDestination = 'game-screen';
			socket.emit('register', { username });
		});

		const buttonMultiplayer =
			this.element.querySelector<HTMLElement>('.play-button-multi')!;

		buttonMultiplayer.addEventListener('click', event => {
			event.preventDefault();

			const username = this.pseudoInput.value.trim();
			if (username.length < 2) {
				this.usernamePopup.show();
				return;
			}
			this.pendingDestination = 'search-room';
			socket.emit('register', { username });
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
		this.socket.on('join-room-success', this.onJoinRoomSuccess);
	}

	hide(): void {
		this.element.style.display = 'none';
		this.socket.off('register_success', this.onRegisterSuccess);
		this.socket.off('register_error', this.onRegisterError);
		this.socket.off('join-room-success', this.onJoinRoomSuccess);
	}

	private onRegisterSuccess = () => {
		if (this.pendingDestination === 'game-screen') {
			this.socket.emit('create-solo-room');
		} else if (this.pendingDestination === 'search-room') {
			this.sm.show('search-room');
			this.pendingDestination = null;
		}
	};

	private onRegisterError = (message: string) => {
		if (message === 'Username already taken.') {
			this.takenPopup.show();
		} else {
			this.usernamePopup.show();
		}
	};

	private onJoinRoomSuccess = () => {
		if (this.pendingDestination) {
			this.sm.show(this.pendingDestination);
			this.pendingDestination = null;
		}
	};
}
