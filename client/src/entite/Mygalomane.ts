import { Entite } from './Entite.ts';

export default class Mygalomane extends Entite {
	target= null;
	name = 'Mygalomane';
	img = '/images/sprites/Mygalomane.png';
	width = 200;
	height = 200;
	x = (this.boundWidth / 2) - (this.width / 2);
	y = (this.boundHeight / 2) - (this.height / 2);
	speed = 3;
	movementSpeed = 0;
	health = 50;
	damage = 1;
	shootSpeed = 3;

	private dirX = 1;
	private dirY = 1;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

	move(): void {
		this.x += this.dirX * this.speed-1; 
		this.y += this.dirY * (this.speed+5);

		/* Rebond haut bas */
		if(this.y <= 0){
			this.dirY=1;
			this.y=0;
		}else if (this.y + this.height >= this.boundHeight) {
			this.dirY = -1;
			this.y = this.boundHeight - this.height;
		}

		/* Rebond gauche droite */
		if(this.x <= 0){
			this.dirX=1;
			this.x=0;
		}else if(this.x + this.width >= this.boundWidth){
			this.dirX = -1;
			this.x = this.boundWidth - this.width;
		}
	}

	reset(): void {
		this.width = 200;
        this.height = 200;
        this.x = (this.boundWidth / 2) - (this.width / 2);
        this.y = (this.boundHeight / 2) - (this.height / 2);
		this.health = 25;
		this.active = true;
	}
}
