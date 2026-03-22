import { Entite } from './Entite.ts';

export default class Pie extends Entite {
	name = 'pie';
	x = Math.random() * 1600;
	y = Math.random() * 700;
	width = 50;
	height = 50;
	speed = 1;
	movementSpeed = 2;
	health = 5;
	damage = 1;
	shootSpeed = 0;

	move(): void {
		this.x -= this.speed;
	}

	reset(): void {
		this.x = Math.random() * 1600;
		this.y = Math.random() * 700;
		this.health = 5;
		this.active = true;
	}
}
