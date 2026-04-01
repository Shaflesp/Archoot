import type { Socket } from 'socket.io-client';
import type { ViewManager } from '../ViewManager.ts';
import { CanvasView, type View } from './View.ts';
import { SpriteAnimator } from '../SpriteAnimator.ts';

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

	dx: number;
	dy: number;
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
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
	dx: number;
	dy: number;
	hp: number;
	maxHp: number;
	phase?: string;
	beamAngle?: number;

	cables?: {
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		life: number;
		maxLife: number;
	}[];
}

interface DeathEffect {
	x: number;
	y: number;
	width: number;
	height: number;
	animator: SpriteAnimator;
}

interface BossWarning {
	x: number;
	y: number;
	width: number;
	height: number;
	name: string;
}


interface BonusData {
	name: string;
	x: number;
	y: number;
	width: number;
	height: number;
	img: string;
}

export class GameView extends CanvasView implements View {
	socket: Socket;
	sm: ViewManager;

	private startTime: number = 0;

	playerInfo: Map<string, PlayerData> = new Map();
	bulletInfo: Array<BulletData> = [];
	mobsInfo: Array<MobsData> = [];
	bonusInfo: Array<BonusData> = [];

	private bossWarning: BossWarning | null = null;
	private bossWarningTimer: number = 0;
	private readonly WARNING_DURATION = 180; // 3s

	private readonly bossNames = new Set([
		'Mygalomane',
		'Ruche Hour',
		'Brainstorming',
		'Le Tyrus',
	]);

	private playerImages: {
		up: HTMLImageElement;
		down: HTMLImageElement;
		side: HTMLImageElement;
	};

	private bulletImage: HTMLImageElement;
	private rockImage: HTMLImageElement;
	private mobsImages: HTMLImageElement[] = [];
	private deathEffects: Array<DeathEffect> = [];
	private rucheImages: HTMLImageElement[] = [];
	private coeurImage: HTMLImageElement;
	private bonusImage: HTMLImageElement[] = [];

	private pieAnimator: SpriteAnimator | null = null;
	private pieSheet: HTMLImageElement;
	private beeAnimator: SpriteAnimator | null = null;
	private beeSheet: HTMLImageElement;
	private poofSheet: HTMLImageElement;

	private readonly mobImageMap: Map<string, HTMLImageElement>;
	private readonly rucheImageMap: Map<string, HTMLImageElement>;
	private readonly bonusImageMap: Map<string, HTMLImageElement>;

	private deathPopup: HTMLElement;
	private escPopup: HTMLElement;
	private replayButton: HTMLElement;
	private startButton: HTMLElement;
	private announcementEl: HTMLElement;

	private flashDuration: number = 0;
	private lastLives: number | null = null;

	private keysHeld: Set<string> = new Set();
	private rightClickTarget: { x: number; y: number } | null = null;

	private lastMoveEmit: number = 0;
	private readonly MOVE_RATE = 1000 / 60;

	private readonly playerSrcs: string[] = [
		'images/sprites/John_Up.png',
		'images/sprites/John_Down.png',
		'images/sprites/John_Side.png',
	];

	private readonly mobsSrcs: string[] = [
		'/images/sprites/pie_sheet.png',
		'/images/sprites/galinette.png',
		'/images/sprites/spider1.png',
		'/images/sprites/spider2.png',
		'/images/sprites/spider3.png',
		'/images/sprites/spider4.png',
		'/images/sprites/Mygalomane.png', // 6
		'/images/sprites/Brainstorming.png',
		'/images/sprites/LeTyrus.png', // à changer pour tyrus
	];

	private readonly rucheSrcs: string[] = [
		'images/sprites/Ruche_Hour_Green.png',
		'images/sprites/Ruche_Hour_Orange.png',
		'images/sprites/Ruche_Hour_Red.png',
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

		const up = new Image();
		up.src = this.playerSrcs[0];
		const down = new Image();
		down.src = this.playerSrcs[1];
		const side = new Image();
		side.src = this.playerSrcs[2];
		this.playerImages = { up, down, side };

		this.coeurImage = new Image();
		this.coeurImage.src = '/images/coeur.png';

		this.bulletImage = new Image();
		this.bulletImage.src = '/images/Arrow.png';

		this.rockImage = new Image();
		this.rockImage.src = '/images/cailloutyrus.png';

		this.mobsImages = this.loadImages(this.mobsSrcs);
		this.rucheImages = this.loadImages(this.rucheSrcs);
		this.bonusImage = this.loadImages(this.bonusSrcs);

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

		this.poofSheet = new Image();
		this.poofSheet.src = '/images/sprites/poof_sheet.png';

		this.beeSheet = new Image();
		this.beeSheet.onload = () => {
			this.beeAnimator = new SpriteAnimator(
				this.beeSheet,
				2,
				this.beeSheet.width / 2,
				this.beeSheet.height,
				2
			);
		};
		this.beeSheet.src = '/images/sprites/bee_sheet.png';

		this.mobImageMap = new Map([
			['pie', this.mobsImages[0]],
			['galinette cendrée', this.mobsImages[1]],
			['Mygalomane', this.mobsImages[6]],
			['Brainstorming', this.mobsImages[7]],
			['Le Tyrus', this.mobsImages[8]],
		]);

		this.rucheImageMap = new Map([
			['green', this.rucheImages[0]],
			['orange', this.rucheImages[1]],
			['red', this.rucheImages[2]],
		]);

		this.bonusImageMap = new Map([
			['PotionDegats', this.bonusImage[0]],
			['PotionSoin', this.bonusImage[1]],
			['PotionRapidite', this.bonusImage[2]],
			['PotionTirRapide', this.bonusImage[3]],
		]);

		/* Gestion du retour accueil */
		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				socket.emit('player-leave');
				sm.show('home-screen');
			});

		this.deathPopup = this.element.querySelector<HTMLElement>('.death-popup')!;
		this.escPopup = this.element.querySelector<HTMLElement>('.esc-popup')!;
		this.replayButton = this.element.querySelector<HTMLElement>('.replay-button')!;
		this.startButton = document.getElementById('start-game-btn')!;
		this.announcementEl = document.getElementById('game-announcement')!;

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

		this.replayButton.addEventListener('click', () => {
			this.closePopup(this.deathPopup);
			socket.emit('player-leave');
			socket.emit('create-room', 1);
		})
		this.socket.on('join-room-success', this.onJoinRoomSuccess);

		this.startButton?.addEventListener('click', () => {
			this.socket.emit('force-start-game');
			this.startButton.style.display = 'none';
		});

		this.socket.on('game-announcement', this.onAnnouncement);

		this.socket.on('game-started', () => {
			if (this.startButton) this.startButton.style.display = 'none';
			if (this.announcementEl) this.announcementEl.style.display = 'none';
		});
	}

	private gameLoop = () => {
		if (!this.running) return;

		this.emitMovement();

		this.pieAnimator?.update();
		this.deathEffects.forEach(e => e.animator.update());
		this.deathEffects = this.deathEffects.filter(e => !e.animator.isDone());

		if (this.bossWarningTimer > 0) {
			this.bossWarningTimer--;
			if (this.bossWarningTimer === 0) this.bossWarning = null;
		}


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
		const body = document.body;
		body.style.backgroundImage = "url('/images/fondJeu.gif')";

		body.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
		body.style.backgroundBlendMode = 'darken';

		this.element.style.display = 'flex';

		this.startTime = Date.now();

		this.socket.on('playerInfo', this.onPlayerInfo);
		this.socket.on('mobsInfo', this.onMobsInfo);
		this.socket.on('bonusInfo', this.onBonusInfo);

		this.socket.on('boss-warning', this.onBossWarning);

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
		this.socket.off('bonusInfo', this.onBonusInfo);

		this.socket.off('boss-warning', this.onBossWarning);
		this.bossWarning = null;
		this.bossWarningTimer = 0;

		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		this.canvas.removeEventListener('mousedown', this.onMouseDown);
		this.canvas.removeEventListener('mousemove', this.onMouseMove);
		this.canvas.removeEventListener('mouseup', this.onMouseUp);
		this.canvas.removeEventListener('contextmenu', e => e.preventDefault());

		this.replayButton.style.display = 'none';

		this.running = false;
		this.keysHeld.clear();
		this.lastLives = null;
		this.rightClickTarget = null;

		this.playerInfo.clear();
		this.bulletInfo = [];
		this.mobsInfo = [];
		this.bonusInfo = [];
	}

	private onJoinRoomSuccess = (data: {roomId: number, solo: boolean, isCreator:boolean}) => {
		this.replayButton.style.display = data.solo ? 'inline-block' : 'none';

		if (this.startButton) {
			if (!data.solo && data.isCreator) {
				this.startButton.style.display = 'block';
			} else {
				this.startButton.style.display = 'none';
			}
		}
	};

	private onAnnouncement = (msg:string) => {
		if (this.announcementEl) {
			this.announcementEl.innerText = msg;
			this.announcementEl.style.display = 'block';

			this.announcementEl.style.animation = 'none';
			void this.announcementEl.offsetWidth;
			this.announcementEl.style.animation =
				'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both';
		}
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
	};

	private onKeyUp = (e: KeyboardEvent) => {
		this.keysHeld.delete(e.key);
	};

	private emitMovement() {
		const now = Date.now();
		if (now - this.lastMoveEmit < this.MOVE_RATE) return;
		
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

		this.lastMoveEmit = now;
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
		const me = this.getMe();
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
		const me = this.getMe();
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

	private getMe(): PlayerData | null {
		return this.socket.id
			? (this.playerInfo.get(this.socket.id) ?? null)
			: null;
	}

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
		const newIds = new Set(info.mobs.map(m => m.id));

		this.mobsInfo.forEach(m => {
			if (!newIds.has(m.id) && this.poofSheet.complete) {
				this.deathEffects.push({
					x: m.x,
					y: m.y,
					width: m.width,
					height: m.height,
					animator: new SpriteAnimator(
						this.poofSheet,
						4,
						this.poofSheet.width / 4,
						this.poofSheet.height,
						5,
						false
					),
				});
			}
		});

		const hasBoss = this.mobsInfo.some(m => this.bossNames.has(m.name));
		if (hasBoss) {
			this.bossWarning = null;
			this.bossWarningTimer = 0;
		}

		this.mobsInfo = info.mobs;
	};

	private onBonusInfo = (info: { bonuses: Array<BonusData> }) => {
		this.bonusInfo = info.bonuses;
	};

	private onBossWarning = (warning: BossWarning) => {
		this.bossWarning = warning;
		this.bossWarningTimer = this.WARNING_DURATION;
	};

	private loadImages(srcs: string[]): HTMLImageElement[] {
		return srcs.map(src => {
			const img = new Image();
			img.src = src;
			return img;
		});
	}

	private getPlayerImage(p: PlayerData): {
		image: HTMLImageElement;
		flipped: boolean;
	} {
		const { dx, dy } = p;

		if (Math.abs(dx) > Math.abs(dy)) {
			return {
				image: this.playerImages.side,
				flipped: dx < 0,
			};
		}

		if (dy < 0) return { image: this.playerImages.up, flipped: false };
		if (dy > 0) return { image: this.playerImages.down, flipped: false };

		return { image: this.playerImages.down, flipped: false };
	}

	private getMobImage(mob: MobsData): HTMLImageElement {
		if (mob.name === 'araignée') {
			return this.mobsImages[(Math.floor(mob.x) % 4) + 2];
		}
		return this.mobImageMap.get(mob.name) ?? this.mobsImages[3];
	}

	private draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawBossWarning();

		this.bonusInfo.forEach((b: BonusData) => {
			const img = this.bonusImageMap.get(b.name);
			if (img && img.complete && img.naturalWidth !== 0) {
				this.ctx.drawImage(img, b.x, b.y, b.width, b.height);
			} else {
				this.ctx.fillStyle = 'purple';
				this.ctx.fillRect(b.x, b.y, b.width, b.height);
			}
		});

		this.mobsInfo.forEach((m: MobsData) => {
			this.drawExtras(m);
			this.drawMob(m);
		});
		this.drawDeathEffects();

		this.playerInfo.forEach((p: PlayerData) => {
			if (!p.active) {
				this.ctx.globalAlpha = 0.4;
				this.ctx.filter = 'grayscale(100%)';
			}

			const { image, flipped } = this.getPlayerImage(p);

			this.drawFlipped(
				() => this.ctx.drawImage(image, 0, 0, p.width, p.height),
				p.x,
				p.y,
				p.width,
				flipped
			);

			this.ctx.font = '24px Arial';
			this.ctx.fillStyle = p.active ? 'white' : 'red';
			this.ctx.fillText(`${p.username} [${p.score || 0}]`, p.x, p.y - 10);

			this.ctx.globalAlpha = 1;
			this.ctx.filter = 'none';
		});

		const me = this.getMe();
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

		if (this.beeAnimator) {
			this.beeAnimator.update();
		}

		this.bulletInfo.forEach((b: BulletData) => {
			let angle = Math.atan2(b.dy, b.dx) ;

			if (b.ownerId === 'Ruche Hour') {
				angle += Math.PI/4 ;
			} else if (b.ownerId === 'Le Tyrus') {
				angle += 0;
			} else {
				angle += Math.PI / 4;
			}
			const centerX = b.x + b.width / 2;
			const centerY = b.y + b.height / 2;

			this.ctx.save();
			this.ctx.translate(centerX, centerY);
			this.ctx.rotate(angle);

			if (b.ownerId === 'Ruche Hour') {
				this.beeAnimator!.draw(
					this.ctx,
					-b.width / 2,
					-b.height / 2,
					b.width,
					b.height
				);
			} else if (b.ownerId === 'Le Tyrus') {
				this.ctx.drawImage(
					this.rockImage,
					-b.width / 2,
					-b.height / 2,
					b.width,
					b.height
				);
			} else {
				this.ctx.drawImage(
					this.bulletImage,
					-b.width / 2,
					-b.height / 2,
					b.width,
					b.height
				);
			}
			this.ctx.restore();
		});

		if (this.flashDuration > 0) {
			this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.flashDuration--;
		}

		const currentBoss = this.mobsInfo.find(m => this.bossNames.has(m.name));

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
		} else if (m.name === 'Ruche Hour' && m.phase) {
			this.ctx.drawImage(
				this.rucheImageMap.get(m.phase) ?? this.rucheImages[0],
				0,
				0,
				m.width,
				m.height
			);
		} else if (m.name === 'Le Tyrus' && m.phase) {
			const img = this.mobImageMap.get(m.name) ?? this.mobsImages[3];

			this.ctx.save();
			const centerX = m.width / 2;
			const centerY = m.height / 2;
			this.ctx.translate(centerX, centerY);
			if (m.phase === 'jumping') {
				this.ctx.scale(0.85, 1.15);
			} else if (m.phase === 'landing' || m.phase === 'stunned') {
				this.ctx.scale(1.15, 0.85);
			}

			this.ctx.drawImage(
				img,
				-(m.width / 2),
				-(m.height / 2),
				m.width,
				m.height
			);
			this.ctx.restore();
		} else {
			this.ctx.drawImage(this.getMobImage(m), 0, 0, m.width, m.height);
		}

		this.ctx.restore();
	}

	private drawDeathEffects() {
		this.deathEffects.forEach(e => {
			e.animator.draw(this.ctx, e.x, e.y, e.width, e.height);
		});
	}

	private drawExtras(m: MobsData): void {
		if (m.name === 'Mygalomane' && m.cables) {
			m.cables.forEach(cable => {
				this.ctx.save();
				this.ctx.beginPath();
				this.ctx.moveTo(cable.startX, cable.startY);
				this.ctx.lineTo(cable.endX, cable.endY);

				this.ctx.lineWidth = 3;
				this.ctx.lineCap = 'round';
				this.ctx.shadowBlur = 5;
				this.ctx.shadowColor = 'white';

				const alpha = Math.max(0, cable.life / cable.maxLife);
				this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

				this.ctx.stroke();
				this.ctx.restore();
			});
		} else if (m.name === 'Brainstorming' && m.phase && m.beamAngle) {
			const cx = m.x + m.width / 2;
			const cy = m.y + m.height / 2;
			const rays = 8;
			const length = 2000;

			this.ctx.save();

			if (m.phase === 'charging') {
				this.ctx.beginPath();
				this.ctx.setLineDash([10, 15]);
				this.ctx.lineWidth = 2;
				this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';

				for (let i = 0; i < rays; i++) {
					const angle = m.beamAngle + (i * Math.PI * 2) / rays;
					this.ctx.moveTo(cx, cy);
					this.ctx.lineTo(
						cx + Math.cos(angle) * length,
						cy + Math.sin(angle) * length
					);
				}
				this.ctx.stroke(); // ONE stroke for all 8 warning lines
			} else if (m.phase === 'shooting') {

				const angles = [];
				for (let i = 0; i < rays; i++) {
					angles.push(m.beamAngle + (i * Math.PI * 2) / rays);
				}

				this.ctx.beginPath();
				this.ctx.lineWidth = 30;
				this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
				angles.forEach(angle => {
					this.ctx.moveTo(cx, cy);
					this.ctx.lineTo(
						cx + Math.cos(angle) * length,
						cy + Math.sin(angle) * length
					);
				});
				this.ctx.stroke();

				this.ctx.beginPath();
				this.ctx.lineWidth = 15;
				this.ctx.strokeStyle = 'rgba(255, 100, 255, 0.4)';
				angles.forEach(angle => {
					this.ctx.moveTo(cx, cy);
					this.ctx.lineTo(
						cx + Math.cos(angle) * length,
						cy + Math.sin(angle) * length
					);
				});
				this.ctx.stroke();

				this.ctx.beginPath();
				this.ctx.lineWidth = 6;
				this.ctx.strokeStyle = 'white';
				angles.forEach(angle => {
					this.ctx.moveTo(cx, cy);
					this.ctx.lineTo(
						cx + Math.cos(angle) * length,
						cy + Math.sin(angle) * length
					);
				});
				this.ctx.stroke();
			}

			this.ctx.restore();
		}
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

	private drawBossWarning() {
		if (!this.bossWarning) return;

		const w = this.bossWarning;

		const pulse = Math.abs(Math.sin(this.bossWarningTimer * 0.15));

		this.ctx.save();

		this.ctx.fillStyle = `rgba(255, 0, 0, ${0.15 * pulse})`;
		this.ctx.fillRect(w.x, w.y, w.width, w.height);

		this.ctx.strokeStyle = `rgba(255, 50, 50, ${0.8 * pulse})`;
		this.ctx.lineWidth = 4;
		this.ctx.setLineDash([15, 10]);
		this.ctx.strokeRect(w.x, w.y, w.width, w.height);
		this.ctx.setLineDash([]);

		this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
		this.ctx.font = 'bold 28px Arial';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.shadowColor = 'red';
		this.ctx.shadowBlur = 10;
		this.ctx.fillText(
			`⚠ ${w.name} arrive ⚠`,
			w.x + w.width / 2,
			w.y + w.height / 2
		);

		this.ctx.restore();
	}

	private drawFlipped(
		draw: () => void,
		x: number,
		y: number,
		width: number,
		flipped: boolean
	) {
		this.ctx.save();
		if (flipped) {
			this.ctx.translate(x + width, y);
			this.ctx.scale(-1, 1);
		} else {
			this.ctx.translate(x, y);
		}
		draw();
		this.ctx.restore();
	}
}
