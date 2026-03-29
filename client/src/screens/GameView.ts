import type { Socket } from 'socket.io-client';
import type { ViewManager } from '../ViewManager.ts';
import { CanvasView, type View } from './View.ts';
import {SpriteAnimator} from "../SpriteAnimator.ts";

interface PlayerData {
	identifier: string;
	username: string;
	x: number;
	y: number;
	width: number;
	height: number;
	lives: number;
	active: number;
	score: number;
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
	name: string;
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
	dx: number;
	dy: number;
	hp: number;
	maxHp: number;
}

interface BonusData {
	name:string;
    x: number;
    y: number;
    width: number;
    height: number;
    img: string;
}

export class GameView extends CanvasView implements View {
	socket: Socket;
	sm: ViewManager;

	playerInfo: Map<string, PlayerData> = new Map();
	bulletInfo: Array<BulletData> = [];
	mobsInfo: Array<MobsData> = [];
	bonusInfo: Array<BonusData> = [];

	private startTime : number = 0;

	private playerImage: HTMLImageElement;
	private bulletImage: HTMLImageElement;
	private mobsImages: HTMLImageElement[] = [];

	private pieAnimator: SpriteAnimator | null = null;
	private pieSheet: HTMLImageElement;

	private coeurImage: HTMLImageElement;
	private bonusImage: HTMLImageElement[] = [];

	private deathPopup: HTMLElement;
	private escPopup: HTMLElement;

	private flashDuration: number = 0;
	private lastLives: number | null = null;

	private keysHeld: Set<string> = new Set();
	private rightClickTarget: { x: number; y: number } | null = null;

	private lastMoveEmit: number = 0;
	private readonly MOVE_RATE = 1000 / 60;

	private readonly mobsSrcs: string[] = [
		'/images/sprites/pie_sheet.png',
		'/images/sprites/galinette.png',
		'/images/sprites/spider1.png',
		'/images/sprites/spider2.png',
		'/images/sprites/spider3.png',
		'/images/sprites/spider4.png',
		'/images/sprites/Mygalomane.png', // 6
		'/images/sprites/RucheHour.png',
		'/images/sprites/Brainstorming.png',
		'/images/sprites/Mygalomane.png', // à changer pour tyrus
	];

	private readonly bonusSrcs: string[] = [
		'/images/bonus/bonusRouge.png',
		'/images/bonus/bonusVert.png',
		'/images/bonus/bonusBleu.png',
		'/images/bonus/bonusJaune.png',
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

		this.pieSheet = new Image();
		this.pieSheet.onload = () => {
			this.pieAnimator = new SpriteAnimator(
				this.pieSheet,
				4,
				this.pieSheet.width / 4,
				this.pieSheet.height,
				5
			);
		};
		this.pieSheet.src = '/images/sprites/pie_sheet.png';

		this.bonusSrcs.forEach(src => {
			const img = new Image();
			img.src = src;
			this.bonusImage.push(img);
		});

		/* Gestion du retour accueil */
		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				socket.emit('player-leave');
				sm.show('home-screen');
			});

		this.deathPopup = this.element.querySelector<HTMLElement>('.death-popup')!;
		this.escPopup = this.element.querySelector<HTMLElement>('.esc-popup')!;

		this.element
			.querySelector<HTMLElement>('.spectate-button')
			?.addEventListener('click', () => this.closePopup(this.deathPopup));

		this.element
			.querySelector<HTMLElement>('.leave-button')
			?.addEventListener('click', () => {
				this.closePopup(this.deathPopup);
				socket.emit('player-leave');
				sm.show('home-screen');
			});

		this.element
			.querySelector<HTMLElement>('.resume-button')
			?.addEventListener('click', () => this.closePopup(this.escPopup));

		this.element
			.querySelector<HTMLElement>('.quit-button')
			?.addEventListener('click', () => {
				this.closePopup(this.escPopup);
				socket.emit('player-leave');
				sm.show('home-screen');
			});
	}

	private gameLoop = () => {
		if (!this.running) return;

		this.pieAnimator?.update();

		if (this.rightClickTarget !== null) {
			const now = Date.now();
			if (now - this.lastMoveEmit >= this.MOVE_RATE) {
				const dir = this.getDirection(
					this.rightClickTarget.x,
					this.rightClickTarget.y
				);
				if (dir) {
					this.socket.emit('move', dir);
					this.lastMoveEmit = now;
				}
			}
		}
		this.draw();
		requestAnimationFrame(this.gameLoop);
	};

	show(): void {
		this.element.style.display = 'flex';
		this.socket.on('playerInfo', this.onPlayerInfo);
		this.socket.on('mobsInfo', this.onMobsInfo);
		this.socket.on('bonusInfo', this.onBonusInfo);
		this.startTime = Date.now();

		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
		this.canvas.addEventListener('mousedown', this.onMouseDown);
		this.canvas.addEventListener('mousemove', this.onMouseMove);
		this.canvas.addEventListener('mouseup', this.onMouseUp);
		this.canvas.addEventListener('contextmenu', e => e.preventDefault());

		this.running = true;
		this.gameLoop();
	}

	hide(): void {
		this.element.style.display = 'none';

		this.closePopup(this.deathPopup);
		this.closePopup(this.escPopup);

		this.socket.off('playerInfo', this.onPlayerInfo);
		this.socket.off('mobsInfo', this.onMobsInfo);
		this.socket.off('bonusInfo');

		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		this.canvas.removeEventListener('mousedown', this.onMouseDown);
		this.canvas.removeEventListener('mousemove', this.onMouseMove);
		this.canvas.removeEventListener('mouseup', this.onMouseUp);
		this.canvas.removeEventListener('contextmenu', e => e.preventDefault());

		this.running = false;
		this.keysHeld.clear();
		this.lastLives = null;
		this.rightClickTarget = null;

		this.playerInfo.clear();
		this.bulletInfo = [];
		this.mobsInfo = [];
		this.bonusInfo = [];
	}

	private openPopup(popup: HTMLElement) {
		popup.style.display = 'flex';
		popup.classList.add('visible');
	}

	private closePopup(popup: HTMLElement) {
		popup.style.display = 'none';
		popup.classList.remove('visible');
	}

	private onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			const escVisible = this.escPopup.classList.contains('visible');
			escVisible
				? this.closePopup(this.escPopup)
				: this.openPopup(this.escPopup);
			return;
		}
		this.keysHeld.add(e.key);
		this.emitMovement();
	};

	private onKeyUp = (e: KeyboardEvent) => {
		this.keysHeld.delete(e.key);
	};

	private emitMovement() {
		const up = this.keysHeld.has('ArrowUp') || this.keysHeld.has('z');
		const down = this.keysHeld.has('ArrowDown') || this.keysHeld.has('s');
		const left = this.keysHeld.has('ArrowLeft') || this.keysHeld.has('q');
		const right = this.keysHeld.has('ArrowRight') || this.keysHeld.has('d');

		let dx = 0;
		let dy = 0;

		if (up) dy -= 1;
		if (down) dy += 1;
		if (left) dx -= 1;
		if (right) dx += 1;

		if (dx === 0 && dy === 0) return;

		const dist = Math.hypot(dx, dy);
		this.socket.emit('move', { dx: dx / dist, dy: dy / dist });
	}

	private onMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		const { x, y } = this.getCanvasCoords(e);

		if (e.button === 0) {
			const dir = this.getDirection(x, y);
			if (dir) this.socket.emit('shoot', dir);
		}
		if (e.button === 2) {
			this.rightClickTarget = { x, y };
		}
	};

	private onMouseMove = (e: MouseEvent) => {
		if (this.rightClickTarget === null) return;
		const { x, y } = this.getCanvasCoords(e);
		this.rightClickTarget = { x, y };
	};

	private onMouseUp = (e: MouseEvent) => {
		if (e.button === 2) this.rightClickTarget = null;
	};

	private getDirection(
		x: number,
		y: number
	): { dx: number; dy: number } | null {
		const me = this.socket.id ? this.playerInfo.get(this.socket.id) : null;
		if (!me) return null;

		const centerX = me.x + me.width / 2;
		const centerY = me.y + me.height / 2;
		const dist = Math.hypot(x - centerX, y - centerY);

		if (dist < me.width / 2) return null;

		return {
			dx: (x - centerX) / dist,
			dy: (y - centerY) / dist,
		};
	}

	private getCanvasCoords(e: MouseEvent): { x: number; y: number } {
		const rect = this.canvas.getBoundingClientRect(); //Independant du zoom de l'ecran
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};
	}

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
			if (this.lastLives !== 0 && me.lives === 0) {
				this.handlePlayerDeath(me);
			}

			this.lastLives = me.lives;
		}
	};

	private handlePlayerDeath(player: PlayerData) {
		this.deathPopup.style.display = 'flex';
		this.deathPopup.classList.add('visible');

		const durationMs = Date.now() - this.startTime;
		const totalSeconds = Math.floor(durationMs / 1000);
		
		const timeBonus = totalSeconds * 10;
    	const combatScore = player.score;
    	const totalScore = combatScore + timeBonus;
		
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		const killedEnemies = Math.floor(player.score / 100);
		
    	const statElement = this.deathPopup.querySelector('#death-stats');

		if (statElement) {
			statElement.innerHTML = `
            <p>Temps : <strong>${timeString}</strong> (+${timeBonus} pts)</p>
            <p>Monstres : <strong>${killedEnemies}</strong> (${combatScore} pts)</p>
            <hr>
            <p>Score Final : <strong style="font-size: 1.5em;">${totalScore}</strong></p>
        `;
		}

		this.socket.emit('add-score', {
			username: player.username,
			score: totalScore,
		});

		console.log(`Score de ${player.score} enregistré pour ${player.username}`);
	}

	private onMobsInfo = (info: { mobs: Array<MobsData> }) => {
		this.mobsInfo = info.mobs;
	};

	private onBonusInfo = (info: { bonuses: Array<BonusData> }) => {
		this.bonusInfo = info.bonuses;
	};

	private getMobImage(mob: MobsData): HTMLImageElement {
		switch (mob.name) {
			case 'pie':
				return this.mobsImages[0];
			case 'galinette cendrée':
				return this.mobsImages[1];
			case 'araignée':
				const index = (Math.floor(mob.x) % 4) + 2; // pour régler pb d'affichage sur le canva
				return this.mobsImages[index];
			case 'Mygalomane':
				return this.mobsImages[6];
			case 'Ruche Hour':
				return this.mobsImages[7];
			case 'Brainstorming':
				return this.mobsImages[8];
			case 'Le Tyrus':
				return this.mobsImages[9];
			default:
				return this.mobsImages[3];
		}
	}

	private getBonusImage(name: string): HTMLImageElement {
		switch (name) {
			case 'PotionDegats':
				return this.bonusImage[0];
			case 'PotionSoin':
				return this.bonusImage[1];
			case 'PotionRapidite':
				return this.bonusImage[2];
			case 'PotionTirRapide':
				return this.bonusImage[3];
			default:
				return this.bonusImage[1];
		}
	}

	private draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (!this.playerImage.complete) return;

		this.bonusInfo.forEach((b: BonusData) => {
			const img = this.getBonusImage(b.name);
			if (img && img.complete && img.naturalWidth !== 0) {
				this.ctx.drawImage(img, b.x, b.y, b.width, b.height);
			} else {
				this.ctx.fillStyle = 'purple';
				this.ctx.fillRect(b.x, b.y, b.width, b.height);
			}
		});

		this.mobsInfo.forEach((m: MobsData) => {
			this.drawMob(m);
		});

		this.playerInfo.forEach((p: PlayerData) => {
			if (!p.active) {
				this.ctx.globalAlpha = 0.4;
				this.ctx.filter = 'grayscale(100%)';
			}

			this.ctx.drawImage(this.playerImage, p.x, p.y, p.width, p.height);
			this.ctx.font = '24px Arial';
			this.ctx.fillStyle = p.active ? 'white' : 'red';
			this.ctx.fillText(`${p.username} [${p.score || 0}]`, p.x, p.y - 10);

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
			this.ctx.save();
			this.ctx.fillStyle = 'yellow';
			this.ctx.font = 'bold 28px Arial';
			this.ctx.textAlign = 'right';
			this.ctx.shadowColor = 'black';
			this.ctx.shadowBlur = 4;

			this.ctx.fillText(`Score: ${me.score || 0}`, this.canvas.width - 10, 70);
			this.ctx.restore();
		}

		this.bulletInfo.forEach((b: BulletData) => {
			const angle = Math.atan2(b.dy, b.dx) + Math.PI / 4;
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

		const bossNames = ['Mygalomane', 'Ruche Hour', 'Brainstorming', 'Le Tyrus'];
		const currentBoss = this.mobsInfo.find((m: MobsData) =>
			bossNames.includes(m.name)
		);

		if (currentBoss) {
			this.drawBossBar(currentBoss);
		}
	}

	private drawMob(m: MobsData) {
		this.ctx.save();

		const flipped = m.dx > 0;
		if (flipped) {
			this.ctx.translate(m.x + m.width, m.y);
			this.ctx.scale(-1, 1);
		} else {
			this.ctx.translate(m.x, m.y);
		}

		if (m.name === 'pie' && this.pieAnimator) {
			this.pieAnimator.draw(this.ctx, 0, 0, m.width, m.height);
		} else {
			this.ctx.drawImage(this.getMobImage(m), 0, 0, m.width, m.height);
		}

		this.ctx.restore();
	}

	private drawBossBar(boss: MobsData): void {
		this.ctx.save();

		const barWidth = 600;
		const barHeight = 30;
		const x = (this.canvas.width - barWidth) / 2;
		const y = 20; // Distance from the top of the screen

		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		this.ctx.fillRect(x, y, barWidth, barHeight);

		const currentHp = boss.hp || 0;
		const maxHp = boss.maxHp || 1;
		const hpRatio = Math.max(0, currentHp / maxHp);

		this.ctx.fillStyle = 'red';
		this.ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(x, y, barWidth, barHeight);

		// 4. Draw Boss Name and HP Text
		this.ctx.fillStyle = 'white';
		this.ctx.font = 'bold 20px Arial';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.shadowColor = 'black';
		this.ctx.shadowBlur = 4;

		const text = `${boss.name} - ${Math.ceil(currentHp)} / ${maxHp}`;
		this.ctx.fillText(text, x + barWidth / 2, y + barHeight / 2 + 2);

		this.ctx.shadowBlur = 0;

		this.ctx.restore();
	}
}
