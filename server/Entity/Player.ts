import type Bonus from '../../client/src/bonus/Bonus.ts';
import type { Collidable } from './Collidable.ts';

export class Player {
	active: boolean = true;

	private bounds: { width: number; height: number };

	movementSpeed: number;
	x: number;
	y: number;
	width: number;
	height: number;
	username: string;
	identifier: string;

	lives: number;
	invincibleUntil: number;
	score: number;
	bonusList:Bonus[]=[];

	constructor(id: string, username: string, width: number, height: number) {
		this.bounds = { width, height };

		this.movementSpeed = 10;
		this.x = width/2;
		this.y = height/2;
		this.width = 100; //a ajuster selon la taille que l'on veut pour la hitbox /Sprite
		this.height = 100;
		this.username = username ? username : 'placeholder';
		this.identifier = id;

		this.lives = 5;
		this.invincibleUntil = 0;
		this.score = 0;
	}

	move(dx: number, dy: number) {
		const newx = this.x + dx * this.movementSpeed;
		const newy = this.y + dy * this.movementSpeed;
	
		if (newx >= 0 && newx <= this.bounds.width - this.width) {
			this.x = newx;
		}
		if (newy >= 0 && newy <= this.bounds.height - this.height) {
			this.y = newy;
		}
	}
	

	collidesWith(other: Collidable): boolean {
		return (
			this.x < other.x + other.width &&
			this.x + this.width > other.x &&
			this.y < other.y + other.height &&
			this.y + this.height > other.y
		);
	}

	takeDamage(amount: number): void {
		if (Date.now() < this.invincibleUntil) return;
		this.lives -= amount;
		this.invincibleUntil = Date.now() + 1500;
		if (this.lives <= 0) {
			this.lives = 0;
			this.active = false;
		}
	}

	isDead(): boolean {
		return this.lives <= 0;
	}

	getAsJson() {
		return {
			identifier: this.identifier,
			username: this.username,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			lives: this.lives,
			active: this.active,
			score: this.score,
		};
	}
}
