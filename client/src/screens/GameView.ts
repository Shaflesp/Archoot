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

		window.addEventListener('keydown', e => {
			switch (e.key) {
				case 'ArrowUp':
					socket.emit('keypress', 'up');
					break;
				case 'ArrowDown':
					socket.emit('keypress', 'down');
					break;
				case 'ArrowLeft':
					socket.emit('keypress', 'left');
					break;
				case 'ArrowRight':
					socket.emit('keypress', 'right');
					break;
			}
		});

		this.gameLoop();
	}

	hide(): void {
		this.element.style.display = 'none';
	}

	private gameLoop = () => {
		this.draw();
		requestAnimationFrame(this.gameLoop);
	};

	private draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (const identifier in this.playerInfo) {
			const p = this.playerInfo[identifier];

			const image = new Image();
			image.src = '/images/cobaye.png';

			this.ctx.drawImage(image, p.x, p.y, 30, 30);
		}
	}
}
