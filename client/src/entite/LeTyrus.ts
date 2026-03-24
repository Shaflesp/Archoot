import { Entite } from './Entite.ts';

export default class LeTyrus extends Entite {
	name = 'Le Tyrus';
	width = 600;
	height = 600;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;
	speed = 1;
	movementSpeed = 0;
	health = 25;
	damage = 1;
	shootSpeed = 3;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

	move(): void {
		this.x -= this.speed;
	}

	reset(): void {
		this.width = 600;
		this.height = 600;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 25;
		this.active = true;
	}
}
