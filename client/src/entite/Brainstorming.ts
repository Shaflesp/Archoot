import { Entite } from './Entite.ts';

export default class Brainstorming extends Entite {
	target = null;
	img='/images/sprites/Brainstorming.png';
	name = 'Brainstorming';
	width = 600;
	height = 600;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;
	speed = 2;
	movementSpeed = 2;
	health = 15;
	damage = 2;
	shootSpeed = 1;

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
		this.y = this.boundHeight/ 2 - this.height / 2;
		this.health = 15;
		this.active = true;
	}
}
