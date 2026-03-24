import { Entite } from './Entite.ts'

export default class Spider extends Entite {
	name = 'araignée';
	x = Math.random() * this.boundWidth - 50;
	y = 0;
	width = 50;
	height = 50;
	speed = 3;
	movementSpeed = 2;
	health = 5;
	damage = 1;
	shootSpeed = 0;
	private climbing = false;
	target = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
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
	}
}
