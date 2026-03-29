import { Entite } from './Entite.ts';

export default class RucheHour extends Entite {
	name = 'Ruche Hour';
	img = '/images/sprites/RucheHour.png';
	width = 300;
	height = 300;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;
	speed = 4;
	movementSpeed = 3;
	health = 150;
	damage = 1;
	shootSpeed = 4;
	target = null;
	
	private dirX = 1;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
	}

	move(): void {
		this.x += this.dirX * this.speed;

		// bord droit
		if(this.x+this.width >= this.boundWidth){
			this.dirX = -1;
			this.y += 80;
			this.x = this.boundWidth-this.width;
		}

		//bord gauche
		if(this.x <=0){
			this.dirX = 1;
			this.y += 80;
			this.x = 0;
		}

		// tp en haut 
		if(this.y + this .height >= this.boundHeight) {
			this.y=0;
		}
	}

	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}

	reset(): void {
		this.width = 300;
		this.height = 200;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 150;
		this.active = true;
	}
}
