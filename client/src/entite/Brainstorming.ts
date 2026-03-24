import { Entite } from './Entite.ts';
const boundWidth: number = 1680;
const boundHeight: number = 800;

export default class Brainstorming extends Entite {
	target=null
	name = 'Brainstorming';
	x = 0;
	y = 0;
	width = 50;
	height = 50;
	speed = 2;
	movementSpeed = 2;
	health = 15;
	damage = 2;
	shootSpeed = 1;

	move(): void {
		this.x -= this.speed;
	}

	reset(): void {
		this.x = 0;
		this.y = 0;
		this.health = 15;
		this.active = true;
	}
}
