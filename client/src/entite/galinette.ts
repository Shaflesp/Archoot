import { Entite } from './Entite.ts';

export default class Galinette extends Entite {
	name = 'galinette cendrée';
	img = '/images/sprites/galinette.png';
	width = 50;
	height = 50;
	x = 0;
	y = 0;
	speed = 10;
	movementSpeed = 2;
	health = 10;
	damage = 1;
	shootSpeed = 0;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.y=Math.random() * (this.boundHeight - this.height);
	}

	move(): void {
		this.x += this.speed;
	}

	reset(): void {
		this.x = 0;
		this.y=Math.random() * (this.boundHeight - this.height);		
		this.health = 10;
		this.active = true;
	}
}
