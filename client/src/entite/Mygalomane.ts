import { Entite } from './Entite.ts';
const boundWidth: number = 1680;
const boundHeight: number = 800;

export default class Mygalomane extends Entite {
	target= null;
	name = 'Mygalomane';
	x = boundWidth/2;
	y = boundHeight/2;
	width = 250;
	height = 250;
	speed = 2;
	movementSpeed = 0;
	health = 25;
	damage = 1;
	shootSpeed = 3;

	move(): void {
		
	}

	reset(): void {
		this.x = 900;
		this.y = 400;
		this.health = 25;
		this.active = true;
	}
}
