import type { Collidable } from './Collidable.ts';

export class Bullet implements Collidable {
	private bounds: { width: number; height: number };

	x: number;
	y: number;
	width: number = 10;
	height: number = 10;
	dx: number;
	dy: number;
	ownerId: string;
	active: boolean;
	speed: number;

	constructor(width:number, height:number) {
		this.bounds = { width, height };

		this.x = 0;
		this.y = 0;
		this.dx = 0;
		this.dy = 0;
		this.ownerId = '';
		this.active = false;
		this.speed = 8;
	}

	fire(x: number, y: number, dx: number, dy: number, ownerId: string) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.ownerId = ownerId;
		this.active = true;
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
			ownerId: this.ownerId,
			active: this.active,
		};
	}
}

export class BulletPool {
	pool: Array<Bullet>;

	constructor(size: number, width: number, height: number) {
		this.pool = [];
		for (let i: number = 0; i < size; i++) {
			this.pool.push(new Bullet(width, height));
		}
	}

	acquire(): Bullet | null {
		const bullet = this.pool.find(b => !b.active);
		return bullet != null ? bullet : null;
	}

	updateAll() {
		this.pool.forEach(b => b.update());
	}

	getActive(): Array<Bullet> {
		return this.pool.filter(b => b.active);
	}
}
