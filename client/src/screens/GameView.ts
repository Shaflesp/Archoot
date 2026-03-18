import type { Socket } from 'socket.io-client';
import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';

interface PlayerData {
    identifier: string;
    username: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export class GameView implements View {

	element = document.getElementById('game-screen')!;
	canvas = this.element.querySelector<HTMLCanvasElement>('.gameCanvas')!;
	ctx = this.canvas.getContext('2d')!;

	socket: Socket;
	sm: ViewManager;

	playerInfo: Map<string, PlayerData> = new Map();

	private playerImage: HTMLImageElement;

	private running: boolean = false;


	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;

		this.playerImage = new Image();
    	this.playerImage.src = '/images/cobaye.png';

		/* Gestion du retour accueil */
		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				console.log('Bouton retour cliqué (via Game)');

				socket.emit('player-leave');
				sm.show('home-screen');
			});
	}

	show(): void {
		this.element.style.display = 'flex';
		this.socket.on('playerInfo', this.onPlayerInfo);
		window.addEventListener('keydown', this.onKeyDown);
		this.running = true;
		this.gameLoop();
	}

	hide(): void {
		this.element.style.display = 'none';
		this.socket.off('playerInfo', this.onPlayerInfo);
		window.removeEventListener('keydown', this.onKeyDown);
		this.running = false;
	}

	private onKeyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowUp':    this.socket.emit('keypress', 'up');    break;
			case 'ArrowDown':  this.socket.emit('keypress', 'down');  break;
			case 'ArrowLeft':  this.socket.emit('keypress', 'left');  break;
			case 'ArrowRight': this.socket.emit('keypress', 'right'); break;
		}
	};

	private onPlayerInfo = (info: any) => {
		this.playerInfo = new Map(Object.entries(info));
	};	

	private gameLoop = () => {
		if (!this.running) return;
		this.draw();
		requestAnimationFrame(this.gameLoop);
	};

	private draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if(!this.playerImage.complete) return;

		this.playerInfo.forEach((p: PlayerData) => {
			this.ctx.drawImage(this.playerImage, p.x, p.y, p.width, p.height);
			this.ctx.font = '12px Arial';
			this.ctx.fillText(p.username, p.x, p.y - 10);
		});
	}
}
