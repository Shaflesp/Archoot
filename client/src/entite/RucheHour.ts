import { Entite } from './Entite.ts';

export default class RucheHour extends Entite {
	name = 'Ruche Hour';
	width = 300;
	height = 300;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;

	speed = 3;
	movementSpeed = 2;
	readonly baseSpeed: number = 3;
	readonly baseMovementSpeed: number = 2;

	health = 150;
	maxHp;
	damage = 1;
	shootSpeed = 4;
	target = null;

	private horizontalDir: number = -1;
	private verticalDir: number = 1;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;
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

	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}

	reset(): void {
		this.width = 300;
		this.height = 200;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 150;
		this.active = true;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;

		this.horizontalDir = -1;
		this.verticalDir = Math.random() < 0.5 ? 1 : -1;
	}
}
