import { Entite } from './Entite';

export default class LeTyrus extends Entite {
	name = 'Le Tyrus';
	x = 900;
	y = 400;
	width = 50;
	height = 50;
	speed = 1;
	movementSpeed = 0;
	health = 25;
	damage = 1;
	shootSpeed = 3;

	move(): void {
		this.x -= this.speed;
	}
}
