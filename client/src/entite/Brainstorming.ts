import { Entite } from './Entite.ts';

export default class Brainstorming extends Entite {
	target = null;
	name = 'Brainstorming';
	width = 200;
	height = 200;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;

	speed = 6;
	movementSpeed = 2;
	readonly baseSpeed: number = 6;
	readonly baseMovementSpeed: number = 2;

	health = 300;
	maxHp;
	damage = 2;
	shootSpeed = 1;

	phase: 'bouncing' | 'shooting' = 'bouncing';
	phaseTimer: number = 0;
	beamAngle: number = 0;

	private dirX: number = 1;
	private dirY: number = 1;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;
	}

	move(): void {
		this.phaseTimer++;

		if (this.phase === 'bouncing') {
			this.x += this.dirX * this.speed;
			this.y += this.dirY * this.speed;

			//Gauche / Droite
			if (this.x <= 0) {
				this.dirX = 1;
				this.x = 0;
			} else if (this.x + this.width >= this.boundWidth) {
				this.dirX = -1;
				this.x = this.boundWidth - this.width;
			}

			// Haut / Bas
			if (this.y <= 0) {
				this.dirY = 1;
				this.y = 0;
			} else if (this.y + this.height >= this.boundHeight) {
				this.dirY = -1;
				this.y = this.boundHeight - this.height;
			}

			// 4s
			if (this.phaseTimer >= 240) {
				this.phase = 'shooting';
				this.phaseTimer = 0;
			}
		} else if (this.phase === 'shooting') {
			// 1.5s
			this.beamAngle += 0.008;

			if (this.phaseTimer >= 90) {
				this.phase = 'bouncing';
				this.phaseTimer = 0;

				this.dirX = Math.random() < 0.5 ? 1 : -1;
				this.dirY = Math.random() < 0.5 ? 1 : -1;
			}
		}
	}

	getVectors(): number[] {
		const vectors = [];
		const rays = 12;
		for (let i = 0; i < rays; i++) {
			vectors.push(this.beamAngle + (i * Math.PI * 2) / rays);
		}
		return vectors;
	}

	reset(): void {
		this.width = 200;
		this.height = 200;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 300;
		this.active = true;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;
	}

	getAsJson() {
		return {
			...super.getAsJson(),
			phase: this.phase,
			beamAngle: this.beamAngle,
		};
	}
}
