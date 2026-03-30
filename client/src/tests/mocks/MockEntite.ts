import { Entite } from '../../entite/Entite.ts';

export class MockEntite extends Entite {
	name = 'mock';
	x = 0;
	y = 0;
	width = 10;
	height = 10;
	health = 100;
	maxHp = 100;

	damage = 10;
	shootSpeed = 1;

	movementSpeed = 1;
	speed = 1;
	baseSpeed = 1;
	baseMovementSpeed = 1;

	move(): void {}

	reset(): void {
		this.health = this.maxHp;
	}
}
