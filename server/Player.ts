export class Player {
	movementSpeed: number;
	x: number;
	y: number;
	username: string;
	identifier: string;

	constructor(id: string, username: string) {
		this.movementSpeed = 5;
		this.x = 0;
		this.y = 0;
		this.username = username? 'placeholder' : username;
		this.identifier = id;
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

	getAsJson() {
		return {
			identifier: this.identifier,
			x: this.x,
			y: this.y,
		};
	}
}
