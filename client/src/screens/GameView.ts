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
}

interface BulletData {
	x: number;
	y: number;
	width: number;
	height: number;
	ownerId: string;
	active: boolean;
}

interface EnemyData {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
	imageIndex: number;
}

export class GameView extends CanvasView implements View{
	socket: Socket;
	sm: ViewManager;

	playerInfo: Map<string, PlayerData> = new Map();
	bulletInfo: Array<BulletData> = [];
	enemies: EnemyData[] = [];


	private playerImage: HTMLImageElement;
	private bulletImage: HTMLImageElement;
	private enemyImages: HTMLImageElement[] = [];

	private readonly enemySrcs: string[] = [
		'/images/sprites/pie.gif',
		'/images/sprites/galinette.png',
		'/images/sprites/spider1.png',
		'/images/sprites/spider2.png'
	];

	private running: boolean = false;

	constructor(sm: ViewManager, socket: Socket) {
		super('game-screen');

		this.socket = socket;
		this.sm = sm;

		this.playerImage = new Image();
		this.playerImage.src = '/images/cobaye.png';

		this.bulletImage = new Image();
		this.bulletImage.src = '/images/Arrow.png';

		this.enemySrcs.forEach(src => {
			const img = new Image();
			img.src = src;
			this.enemyImages.push(img);
		});

		/* Gestion du retour accueil */
		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				console.log('Bouton retour cliqué (via Game)');

				socket.emit('player-leave');
				sm.show('home-screen');
			});
			setInterval(() => {
				if (this.running) this.spawnEnemy();
			}, 1500);
	}

	private spawnEnemy() {
		const randomImageIndex = Math.floor(Math.random() * this.enemyImages.length);
        this.enemies.push({
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - 60),
            width: 50,
            height: 50,
            speed: 3 + Math.random() * 4,
			imageIndex: randomImageIndex,
        });
    }

	show(): void {
		this.element.style.display = 'flex';
		this.socket.on('playerInfo', this.onPlayerInfo);
		window.addEventListener('keydown', this.onKeyDown);
		this.canvas.addEventListener('click', this.onMouseClick);
		this.running = true;
		this.gameLoop();
	}

	hide(): void {
		this.element.style.display = 'none';
		this.socket.off('playerInfo', this.onPlayerInfo);
		window.removeEventListener('keydown', this.onKeyDown);
		this.canvas.removeEventListener('click', this.onMouseClick);
		this.running = false;
	}

	private onKeyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowUp':
				case 'z':
				this.socket.emit('keypress', 'up');
				break;
			case 'ArrowDown':
				case 's':
				this.socket.emit('keypress', 'down');
				break;
			case 'ArrowLeft':
				case 'q': 
				this.socket.emit('keypress', 'left');
				break;
			case 'ArrowRight':
				case 'd': 
				this.socket.emit('keypress', 'right');
				break;
		}
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
	};

	private gameLoop = () => {
		if (!this.running) return;
		this.draw();
		requestAnimationFrame(this.gameLoop);
	};

	private draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (!this.playerImage.complete) return;

		this.enemies.forEach((en, index) => {
			en.x -= en.speed;
			const img = this.enemyImages[en.imageIndex];
			this.ctx.drawImage(img, en.x, en.y, en.width, en.height);
			if (en.x + en.width < 0) {
				this.enemies.splice(index, 1);
			}
		});

		this.playerInfo.forEach((p: PlayerData) => {
			this.ctx.drawImage(this.playerImage, p.x, p.y, p.width, p.height);
			this.ctx.font = '12px Arial';
			this.ctx.fillText(p.username, p.x, p.y - 10);
		});

		this.bulletInfo.forEach((b: BulletData) => {
			this.ctx.drawImage(this.bulletImage, b.x, b.y, b.width, b.height);
		});
	}
}
