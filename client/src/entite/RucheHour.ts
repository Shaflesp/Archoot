import { Entite } from './Entite.ts';

export default class RucheHour extends Entite {
	name = 'Ruche Hour';
	x = 900;
	y = 400;
	width = 100;
	height = 100;
	speed = 0;
	movementSpeed = 3;
	health = 30;
	damage = 1;
	shootSpeed = 4;

	move(): void {
		this.x -= this.speed;
	}

	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}

	reset(): void {
		this.x = 900;
		this.y = 400;
		this.health = 30;
		this.active = true;
	}
}
