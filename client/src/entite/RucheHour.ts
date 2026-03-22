import { Entite } from './Entite';

export default class RucheHour extends Entite {
	name = 'Ruche Hour';
	x = 900;
	y = 400;
	width = 100;
	height = 100;
	speed = 0;
	movementSpeed = 3;
	health = 30;
	damage = 1;
	shootSpeed = 4;

	move(): void {
		this.x -= this.speed;
	}

	// Overrides base takeDamage to clamp at 0
	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}
}
