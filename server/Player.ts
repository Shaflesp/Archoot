export class Player {
	movementSpeed: number;
	x: number;
	y: number;

	constructor() {
		this.movementSpeed = 5;
		this.x = 0;
		this.y = 0;
	}

	move(direction: string) {
		switch (direction) {
			case 'up':
				this.y = this.y - this.movementSpeed;
				break;
			case 'down':
				this.y = this.y + this.movementSpeed;
				break;
			case 'left':
				this.x = this.x - this.movementSpeed;
				break;
			case 'right':
				this.x = this.x + this.movementSpeed;
				break;
		}
	}
}
