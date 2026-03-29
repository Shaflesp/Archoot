import { Entite } from './Entite.ts'

export default class Spider extends Entite {
	name = 'araignée';
	img: string;
	x = Math.random() * this.boundWidth - 50;
	y = 0;
	width = 50;
	height = 50;

	speed = 3;
	movementSpeed = 2;
	readonly baseSpeed: number = 3;
	readonly baseMovementSpeed: number = 2;

	health = 5;
	damage = 1;
	shootSpeed = 0;
	private climbing = false;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		const idx = Math.random() * 3 + 1;
		this.img = `/images/sprites/spider${idx}.png`;
	}

	move(): void {
		const limitBas = this.boundHeight - this.height;

		if (!this.climbing) {
			this.y += this.speed;
			if (this.y >= limitBas) {
				this.y = limitBas;
				this.climbing = true;
			}
		} else {
			this.y -= this.speed - 1;
			if (this.y <= 0) {
				this.y = 0;
				this.climbing = false;
			}
		}
	}

	reset(): void {
		this.x = Math.random() * 1600;
		this.y = 0;
		this.health = 5;
		this.active = true;
		this.climbing = false;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;
	}
}
