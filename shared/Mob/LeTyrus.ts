import { Entite } from './Entite.ts';
import type { Bullet } from '../Entity/Bullet.ts';

export default class LeTyrus extends Entite {
	name = 'Le Tyrus';
	width = 450;
	height = 450;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight - this.height;

	speed = 1;
	movementSpeed = 0;
	readonly baseSpeed: number = 1;
	readonly baseMovementSpeed: number = 0;

	health = 500;
	maxHp;
	damage = 1;
	shootSpeed = 3;
	target: { x: number; y: number } | null;

	phase: 'idle' | 'jumping' | 'landing' | 'stunned' = 'idle';
	private phaseTimer: number = 0;

	private jumpVx: number = 0;
	private jumpVy: number = 0;
	private groundY: number = 0;
	private readonly gravity: number = 0.8;

	private readonly idleDuration: number = 90; //1.5s
	private readonly stunnedDuration: number = 60; //1s

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;
		this.target = null;
		this.groundY = this.boundHeight - this.height;
	}

	move(): void {
		this.phaseTimer++;

		if (this.phase === 'idle') {
			this.y = this.groundY;
			if (this.phaseTimer >= this.idleDuration) {
				this.startJump();
			}
		} else if (this.phase === 'jumping') {
			this.x += this.jumpVx;
			this.y += this.jumpVy;
			this.jumpVy += this.gravity;

			this.x = Math.max(0, Math.min(this.boundWidth - this.width, this.x));

			if (this.y >= this.groundY) {
				this.y = this.groundY;
				this.phase = 'landing';
				this.phaseTimer = 0;
			}
		} else if (this.phase === 'landing') {
			this.phase = 'stunned';
			this.phaseTimer = 0;
		} else if (this.phase === 'stunned') {
			if (this.phaseTimer >= this.stunnedDuration) {
				this.phase = 'idle';
				this.phaseTimer = 0;
			}
		}
	}

	private startJump() {
		let targetX = this.target ? this.target.x : this.x;

		const jumpHeight = 300;
		const travelTicks = 80; //1,3s
		const margin = 150;

		const minCenterX = margin + this.width / 2;
		const maxCenterX = this.boundWidth - margin - this.width / 2;

		targetX = Math.max(minCenterX, Math.min(maxCenterX, targetX));

		const centerX = this.x + this.width / 2;
		this.jumpVx = (targetX - centerX) / travelTicks;

		this.jumpVy = -Math.sqrt(2 * this.gravity * jumpHeight);

		if (!this.jumpVx) this.jumpVx = 0;

		this.phase = 'jumping';
		this.phaseTimer = 0;
	}

	shoot(acquireBullet: () => Bullet | null): void {
		if (this.phase !== 'landing') return;

		const rockCount = 8;
		const cx = this.x + this.width / 2;
		const cy = this.y + this.height / 2;

		for (let i = 0; i < rockCount; i++) {
			const angle = (i / rockCount) * Math.PI * 2;
			const bullet = acquireBullet();
			if (!bullet) return;

			const bulletX = cx - bullet.width / 2;
			const bulletY = cy - bullet.height / 2;

			bullet.fire(
				bulletX,
				bulletY,
				Math.cos(angle),
				Math.sin(angle),
				this.name,
				this.damage,
				4
			);
		}
	}

	needsTarget(): boolean {
		return true;
	}

	reset(): void {
		this.width = 450;
		this.height = 450;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight - this.height;
		this.health = 500;
		this.maxHp = this.health;

		this.active = true;

		this.phase = 'idle';
		this.phaseTimer = 0;
		this.jumpVx = 0;
		this.jumpVy = 0;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;
	}

	getAsJson() {
		return {
			...super.getAsJson(),
			phase: this.phase,
		};
	}
}
