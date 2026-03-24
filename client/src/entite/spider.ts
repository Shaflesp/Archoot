import { Entite } from './Entite.ts'
const boundWidth: number = 1680;
const boundHeight: number = 800;

export default class Spider extends Entite {
	name = 'araignée';
	x = Math.random() * boundWidth;
	y = 0;
	width = 50;
	height = 50;
	speed = 3;
	movementSpeed = 2;
	health = 5;
	damage = 1;
	shootSpeed = 0;
	private climbing = false;
	target=null;

	move(): void {
		if (!this.climbing) {
			this.y += this.speed;
			if (this.y >= 800) {
				this.y = 800;
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
