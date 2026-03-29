import { Entite } from './Entite.ts';

export default class Brainstorming extends Entite {
	target = null;
	img='/images/sprites/Brainstorming.png';
	name = 'Brainstorming';
	width = 200;
	height = 200;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;
	speed = 6;
	movementSpeed = 2;
	health = 500;
	damage = 2;
	shootSpeed = 1;

	private dirX: number = 1; 
	private dirY: number = 1;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

	move(): void {
		this.x += this.dirX * this.speed;
		this.y += this.dirY * this.speed;

		// gauche droite
		if (this.x <= 0) {
			this.dirX = 1;
			this.x = 0;
		} else if (this.x + this.width >= this.boundWidth) {
			this.dirX = -1; 
			this.x = this.boundWidth - this.width;
		}

		// haut bas
		if (this.y <= 0) {
			this.dirY = 1; 
			this.y = 0;
		} else if (this.y + this.height >= this.boundHeight) {
			this.dirY = -1;
			this.y = this.boundHeight - this.height;
		}
	}

	reset(): void {
		this.width = 200;
		this.height = 200;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight/ 2 - this.height / 2;
		this.health = 500;
		this.active = true;
	}
}
