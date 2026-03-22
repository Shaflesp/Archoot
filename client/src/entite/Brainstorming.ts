import { Entite } from './Entite';

export default class Brainstorming extends Entite {
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
}
