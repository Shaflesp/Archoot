import { Entite } from './Entite.ts';

export default class RucheHour extends Entite {
	name = 'Ruche Hour';
	width = 300;
	height = 300;
	x = 0;
	y = 0;

	speed = 0;
	movementSpeed = 0;
	readonly baseSpeed: number = 0;
	readonly baseMovementSpeed: number = 0;

	health = 150;
	maxHp;
	damage = 1;
	shootSpeed = 10;
	target = null;

	private currentAngle: number = 0;
	private rotationSpeed: number = 0.10;
	private numberOfRays: number = 8;
	shootTimer: number =0;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;

		this.x = -this.width + 1;
		this.y = this.boundHeight / 2 - this.height / 2;
	}

	move(): void {
		if (this.x < 0) {
			console.log(this.x)
			this.x += this.speed;
			if (this.x > 0) {
				this.x = 0;
			}
		} else {
			this.currentAngle += this.rotationSpeed;
		}
	}

	getVectors(): { dx: number; dy: number }[] {
		const vectors = [];
		for (let i = 0; i < this.numberOfRays; i++) {
			const angle = this.currentAngle + (i * Math.PI * 2) / this.numberOfRays;
			vectors.push({
				dx: Math.cos(angle),
				dy: Math.sin(angle),
			});
		}
		return vectors;
	}

	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}

	reset(): void {
		this.width = 300;
		this.height = 200;
		this.x = 0;
		this.y = 0;
		this.health = 150;
		this.active = true;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;
	}
}
