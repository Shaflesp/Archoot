import { Entite } from './Entite.ts';

export default class Galinette extends Entite {
	name = 'galinette cendrée';
	width = 50;
	height = 50;
	x = 0;
	y = 0;

	speed = 6;
	movementSpeed = 2;
	readonly baseSpeed: number = 6;
	readonly baseMovementSpeed: number = 2;

	health = 7;
	maxHp;
	damage = 1;
	shootSpeed = 0;
	target = null;

	private horizontalDir: number = -1;
	private verticalDir: number = 1;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;
		this.y = Math.random() * (this.boundHeight - this.height);
		this.verticalDir = Math.random() < 0.5 ? 1 : -1;
	}

	move(): void {
		this.x += this.speed * this.horizontalDir;

		if (this.x <= 0 && this.horizontalDir === -1) {
			this.horizontalDir = 1;
			this.shiftVertically();
		} else if (
			this.x >= this.boundWidth - this.width &&
			this.horizontalDir === 1
		) {
			this.horizontalDir = -1;
			this.shiftVertically();
		}
	}

	private shiftVertically(): void {
		const step = 60;

		if (this.y + step * this.verticalDir > this.boundHeight - this.height) {
			this.verticalDir = -1;
		} else if (this.y + step * this.verticalDir < 0) {
			this.verticalDir = 1;
		}
		this.y += step * this.verticalDir;
	}

	reset(): void {
		this.x = 0;
		this.y = Math.random() * (this.boundHeight - this.height);
		this.health = 10;
		this.active = true;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;

		this.horizontalDir = -1;
		this.verticalDir = Math.random() < 0.5 ? 1 : -1;
	}
}
