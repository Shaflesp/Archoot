import { Entite } from './Entite.ts';

export default class Mygalomane extends Entite {
	target= null;
	name = 'Mygalomane';
	width = 600;
	height = 600;
	x = (this.canvaWidth / 2) - (this.width / 2);
    y = (this.canvaHeight / 2) - (this.height / 2);
	speed = 2;
	movementSpeed = 0;
	health = 25;
	damage = 1;
	shootSpeed = 3;

	move(): void {
		
	}

	reset(): void {
		this.width = 600;
        this.height = 600;
        this.x = (this.canvaWidth / 2) - (this.width / 2);
        this.y = (this.canvaHeight / 2) - (this.height / 2);
		this.health = 25;
		this.active = true;
	}
}
