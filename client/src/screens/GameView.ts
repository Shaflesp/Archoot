import type { Socket } from 'socket.io-client';
import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';

export class GameView implements View {
	element = document.getElementById('game-screen')!;
	canvas = this.element.querySelector<HTMLCanvasElement>('.gameCanvas')!;
	ctx = this.canvas.getContext('2d')!;

	socket: Socket;
	sm: ViewManager;

	playerInfo: any = {};

	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;

		/* Gestion du retour accueil */
		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				console.log('Bouton retour cliqué (via Game)');

				socket.emit('player:leave');
				sm.show('home-screen');
			});
	}

	show(): void {
		console.log('GameScreen appelé');
		this.element.style.display = 'flex';

		this.socket.on('playerInfo', info => {
			this.playerInfo = info;
		});

		window.addEventListener('keydown', e => {
			switch (e.key) {
				case 'ArrowUp':
					this.socket.emit('keypress', 'up');
					break;
				case 'ArrowDown':
					this.socket.emit('keypress', 'down');
					break;
				case 'ArrowLeft':
					this.socket.emit('keypress', 'left');
					break;
				case 'ArrowRight':
					this.socket.emit('keypress', 'right');
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

			this.ctx.font = '12px';
			this.ctx.fillText(p.username, p.x, p.y - 10);
		}
	}
}
