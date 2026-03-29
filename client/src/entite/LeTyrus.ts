import { Entite } from './Entite.ts';

export default class LeTyrus extends Entite {
	name = 'Le Tyrus';
	img = '/images/sprites/LeTyrus.png';
	width = 200;
	height = 200;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;
	speed = 1;
	movementSpeed = 0;
	health = 500;
	damage = 1;
	shootSpeed = 3;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

	move(): void {
	}

	reset(): void {
		this.width = 200;
		this.height = 200;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 500;
		this.active = true;
	}
}
