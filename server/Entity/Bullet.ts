import type { Collidable } from './Collidable.ts';

export class Bullet implements Collidable {
	private bounds: { width: number; height: number };

	id:number = 0;

	x: number;
	y: number;
	width: number = 30;
	height: number = 30;
	dx: number;
	dy: number;
	ownerId: string;
	active: boolean;
	speed: number = 0;
	damage:number = 1;

	constructor(width: number, height: number) {
		this.bounds = { width, height };

		this.x = 0;
		this.y = 0;
		this.dx = 0;
		this.dy = 0;
		this.ownerId = '';
		this.active = false;
	}

	fire(x: number, y: number, dx: number, dy: number, ownerId: string, damage:number, speed: number) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.ownerId = ownerId;
		this.active = true;
		this.damage = damage;
		this.speed = speed;
	}

	update() {
		if (!this.active) return;
		this.x += this.dx * this.speed;
		this.y += this.dy * this.speed;

		if (
			this.x < 0 ||
			this.x > this.bounds.width ||
			this.y < 0 ||
			this.y > this.bounds.height
		) {
			this.active = false;
		}
	}

	getAsJson() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			dx: this.dx,
			dy: this.dy,
			ownerId: this.ownerId,
			active: this.active,
		};
	}

	reset(): void {
		this.x = 0;
		this.y = 0;
		this.dx = 0;
		this.dy = 0;
		this.ownerId = '';
		this.active = false;
	}
}
