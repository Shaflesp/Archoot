import { Entite } from './Entite.ts';

export default class LeTyrus extends Entite {
	name = 'Le Tyrus';
	width = 450;
	height = 450;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;

	speed = 1;
	movementSpeed = 0;
	readonly baseSpeed: number = 1;
	readonly baseMovementSpeed: number = 0;

	health = 500;
	maxHp;
	damage = 1;
	shootSpeed = 3;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;
	}

	move(): void {}

	reset(): void {
		this.width = 450;
		this.height = 450;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 500;
		this.active = true;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;
	}
}
