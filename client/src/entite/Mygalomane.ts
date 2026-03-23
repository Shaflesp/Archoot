import { Entite } from './Entite.ts';

export default class Mygalomane extends Entite {
	target= null;
	name = 'Darognée';
	x = 900;
	y = 400;
	width = 50;
	height = 50;
	speed = 2;
	movementSpeed = 0;
	health = 25;
	damage = 1;
	shootSpeed = 3;

	move(): void {
		this.x -= this.speed;
	}

	reset(): void {
		this.x = 900;
		this.y = 400;
		this.health = 25;
		this.active = true;
	}
}
