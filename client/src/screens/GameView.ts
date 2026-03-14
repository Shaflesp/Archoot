import type { Socket } from 'socket.io';
import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import { io } from 'socket.io-client';

export class GameView implements View {
	element = document.getElementById('game-screen')!;
	canvas = this.element.querySelector<HTMLCanvasElement>('.gameCanvas')!;
	ctx = this.canvas.getContext('2d')!;

	playerInfo: any = {};

	constructor(sm: ViewManager) {
		/* Gestion du retour accueil */
		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				console.log('Bouton retour cliqué (via Credits)');
				sm.show('home-screen');
			});
	}

	show(): void {
		console.log('GameScreen appelé');
		this.element.style.display = 'flex';

		const socket = io(window.location.hostname + ':8080');

		socket.on('playerInfo', info => {
			this.playerInfo = info;
		});
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
