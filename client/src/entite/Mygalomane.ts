import { Entite } from './Entite.ts';

export default class Mygalomane extends Entite {
	target= null;
	name = 'Mygalomane';
	img = '/images/sprites/Mygalomane.png';
	width = 600;
	height = 600;
	x = (this.boundWidth / 2) - (this.width / 2);
	y = (this.boundHeight / 2) - (this.height / 2);
	speed = 2;
	movementSpeed = 0;
	health = 25;
	damage = 1;
	shootSpeed = 3;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

	move(): void {}

	reset(): void {
		this.width = 600;
        this.height = 600;
        this.x = (this.boundWidth / 2) - (this.width / 2);
        this.y = (this.boundHeight / 2) - (this.height / 2);
		this.health = 25;
		this.active = true;
	}
}
