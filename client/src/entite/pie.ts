import { Entite } from './Entite.ts';

export default class Pie extends Entite {
	name = 'pie';
	x = Math.random() * this.boundWidth - 50;
	y = Math.random() * this.boundHeight - 50;
	width = 50;
	height = 50;
	speed = 1;
	movementSpeed = 2;
	health = 5;
	damage = 1;
	shootSpeed = 0;
	target: { x: number; y: number } | null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.target = null;
	}

	move(): void {
		if (this.target != null) {
			const dx = this.target.x - this.x;
			const dy = this.target.y - this.y;
			const dist = Math.hypot(dx, dy);

			if (dist > 5) {
				this.x += (dx / dist) * this.movementSpeed;
				this.y += (dy / dist) * this.movementSpeed;
			}
		} else {
			this.x -= this.speed;
		}
	}

	reset(): void {
		this.x = Math.random() * 1600;
		this.y = Math.random() * 700;
		this.health = 5;
		this.active = true;
	}

	needsTarget(): boolean {
		return true;
	}
}
