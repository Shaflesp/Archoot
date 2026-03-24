import type { Socket } from 'socket.io-client';
import type { ViewManager } from '../ViewManager.ts';
import  { CanvasView, type View } from './View.ts';

interface PlayerData {
    identifier: string;
    username: string;
    x: number;
    y: number;
    width: number;
    height: number;
	  lives : number;
		active : number;
}

interface BulletData {
	x: number;
	y: number;
	width: number;
	height: number;
	dx: number;
	dy: number;
	ownerId: string;
	active: boolean;
}

interface MobsData {
	name:string;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
	// image: HTMLImageElement;
}

export class GameView extends CanvasView implements View {
	socket: Socket;
	sm: ViewManager;

	playerInfo: Map<string, PlayerData> = new Map();
	bulletInfo: Array<BulletData> = [];
	mobsInfo: Array<MobsData> = [];

	private playerImage: HTMLImageElement;
	private bulletImage: HTMLImageElement;
	private mobsImages: HTMLImageElement[] = [];
	private coeurImage: HTMLImageElement;

	private flashDuration: number = 0;
	private lastLives: number | null = null;

	private keysHeld: Set<string> = new Set();

	private readonly mobsSrcs: string[] = [
		'/images/sprites/pie.gif',
		'/images/sprites/galinette.png',
		'/images/sprites/spider1.png',
		'/images/sprites/spider2.png',
		'/images/sprites/spider3.png',
		'/images/sprites/spider4.png',
	];

	private running: boolean = false;

	constructor(sm: ViewManager, socket: Socket) {
		super('game-screen');

		this.socket = socket;
		this.sm = sm;

		this.playerImage = new Image();
		this.playerImage.src = '/images/cobaye.png';

		this.coeurImage = new Image();
		this.coeurImage.src = '/images/coeur.png';

		this.bulletImage = new Image();
		this.bulletImage.src = '/images/Arrow.png';

		this.mobsSrcs.forEach(src => {
			const img = new Image();
			img.src = src;
			this.mobsImages.push(img);
		});

		/* Gestion du retour accueil */
		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				socket.emit('player-leave');
				sm.show('home-screen');
			});
		// setInterval(() => {
		// 	if (this.running) this.spawnMobs();
		// }, 1500);
	}

	private gameLoop = () => {
		if (!this.running) return;
		this.draw();
		requestAnimationFrame(this.gameLoop);
	};

	show(): void {
		this.element.style.display = 'flex';
		this.socket.on('playerInfo', this.onPlayerInfo);
		this.socket.on('mobsInfo', this.onMobsInfo);

		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp)
		this.canvas.addEventListener('click', this.onMouseClick);
		this.canvas.addEventListener('contextmenu', this.onMouseRightClick);

		this.running = true;
		this.gameLoop();
	}

	hide(): void {
		this.element.style.display = 'none';
		this.socket.off('playerInfo', this.onPlayerInfo);
		this.socket.off('mobsInfo', this.onMobsInfo);

		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp)
		this.canvas.removeEventListener('click', this.onMouseClick);
		this.canvas.removeEventListener('contextmenu', this.onMouseRightClick);
		
		this.running = false;
		this.keysHeld.clear();
	}

	private onKeyDown = (e: KeyboardEvent) => {
		this.keysHeld.add(e.key);
		this.emitMovement();
	};
	
	private onKeyUp = (e: KeyboardEvent) => {
		this.keysHeld.delete(e.key);
	};
	
	private emitMovement() {
		const up    = this.keysHeld.has('ArrowUp')    || this.keysHeld.has('z');
		const down  = this.keysHeld.has('ArrowDown')  || this.keysHeld.has('s');
		const left  = this.keysHeld.has('ArrowLeft')  || this.keysHeld.has('q');
		const right = this.keysHeld.has('ArrowRight') || this.keysHeld.has('d');
	
		let dx = 0;
		let dy = 0;
	
		if (up)    dy -= 1;
		if (down)  dy += 1;
		if (left)  dx -= 1;
		if (right) dx += 1;
	
		if (dx === 0 && dy === 0) return;
	
		// Normalize so diagonal isn't faster
		const dist = Math.hypot(dx, dy);
		this.socket.emit('move', { dx: dx / dist, dy: dy / dist });
	}

	private onMouseRightClick = (e: MouseEvent) => {
		e.preventDefault();
		const me = this.socket.id ? this.playerInfo.get(this.socket.id) : null;
		if (!me) return;
	
		const targetX = e.offsetX;
		const targetY = e.offsetY;
	
		const dist = Math.hypot(targetX - me.x, targetY - me.y);
		if (dist === 0) return;
	
		this.socket.emit('move', {
			dx: (targetX - me.x) / dist,
			dy: (targetY - me.y) / dist
		});
	};

	private onMouseClick = (e: MouseEvent) => {
		const mouseX = e.offsetX;
		const mouseY = e.offsetY;

		let me;
		if (this.socket.id != null) {
			me = this.playerInfo.get(this.socket.id);
		}
		if (!me) return;

		const centerX = me.x + me.width / 2;
		const centerY = me.y + me.height / 2;
		const dist = Math.hypot(mouseX - centerX, mouseY - centerY);

		if (dist === 0) return;

		const dx = (mouseX - centerX) / dist;
		const dy = (mouseY - centerY) / dist;

		this.socket.emit('shoot', { dx, dy });
	};

	private onPlayerInfo = (info: {
		players: any;
		bullets: Array<BulletData>;
	}) => {
		this.playerInfo = new Map(Object.entries(info.players));
		this.bulletInfo = info.bullets;

		//si collision = flash rouge
		const me = this.socket.id ? this.playerInfo.get(this.socket.id) : null;
		if (me) {
			if (this.lastLives !== null && me.lives < this.lastLives) {
				this.flashDuration = 10;
			}
			this.lastLives = me.lives;
		}
	};

	private onMobsInfo = (info: { mobs: Array<MobsData> }) => {
		this.mobsInfo = info.mobs;
	};

	private getMobImage(name: string): HTMLImageElement {
		switch (name) {
			case 'pie':
				return this.mobsImages[0];
			case 'galinette cendrée':
				return this.mobsImages[1];
			case 'araignée':
				const index = Math.floor(Math.random() * (5 - 2) + 3);
				return this.mobsImages[index];
			default:
				return this.mobsImages[3];
		}
	}

	private draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (!this.playerImage.complete) return;

		this.mobsInfo.forEach((m: MobsData) => {
			this.ctx.drawImage(this.getMobImage(m.name), m.x, m.y, m.width, m.height);
		});

		this.playerInfo.forEach((p: PlayerData) => {
			if (!p.active) {
				this.ctx.globalAlpha = 0.4;
				this.ctx.filter = 'grayscale(100%)';
			}

			this.ctx.drawImage(this.playerImage, p.x, p.y, p.width, p.height);
			this.ctx.font = '24px Arial';
			this.ctx.fillStyle = p.active ? 'white' : 'red';
			this.ctx.fillText(p.username, p.x, p.y - 10);

			this.ctx.globalAlpha = 1;
			this.ctx.filter = 'none';
		});

		const me = this.socket.id ? this.playerInfo.get(this.socket.id) : null;
		if (me) {
			for (let i = 0; i < me.lives; i++) {
				this.ctx.drawImage(
					this.coeurImage,
					this.canvas.width - 40 - i * 40,
					0,
					40,
					40
				);
			}
		}

		this.bulletInfo.forEach((b: BulletData) => {
			const angle = Math.atan2(b.dy, b.dx) + Math.PI/4;
			const centerX = b.x + b.width / 2;
			const centerY = b.y + b.height / 2;

			this.ctx.save();
			this.ctx.translate(centerX, centerY);
			this.ctx.rotate(angle);
			this.ctx.drawImage(
				this.bulletImage,
				-b.width / 2,
				-b.height / 2,
				b.width,
				b.height
			);
			this.ctx.restore();
		});

		if (this.flashDuration > 0) {
			this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.flashDuration--;
		}
	}
}
