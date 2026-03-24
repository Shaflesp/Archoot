import { Entite } from './Entite.ts';

export default class Galinette extends Entite {
	name = 'galinette cendrée';
	x = this.boundWidth;
	y = Math.random() * this.boundHeight;
	width = 50;
	height = 50;
	speed = 2;
	movementSpeed = 2;
	health = 5;
	damage = 1;
	shootSpeed = 0;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

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
