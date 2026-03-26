import { Entite } from './Entite.ts';

export default class RucheHour extends Entite {
	name = 'Ruche Hour';
	img = '/images/sprites/RucheHour.png';
	width = 600;
	height = 600;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;
	speed = 0;
	movementSpeed = 3;
	health = 30;
	damage = 1;
	shootSpeed = 4;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

	move(): void {
		this.x -= this.speed;
	}

	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}

	reset(): void {
		this.width = 600;
		this.height = 600;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 30;
		this.active = true;
	}
}
