import { Entite } from './Entite.ts';

export default class Galinette extends Entite {
	name = 'galinette cendrée';
	x = 1680;
	y = Math.random() * 800;
	width = 50;
	height = 50;
	speed = 2;
	movementSpeed = 2;
	health = 5;
	damage = 1;
	shootSpeed = 0;
	target=null;

	move(): void {
		this.x -= this.speed;
	}

	reset(): void {
		this.x = 1680;
		this.y = Math.random() * 800;
		this.health = 5;
		this.active = true;
	}
}
