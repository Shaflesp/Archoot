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
		this.username = username ? username : 'placeholder';
		this.identifier = id;
	}

	move(direction: string) {
		let newx = this.x;
		let newy = this.y;

		switch (direction) {
			case 'up':
				newy = this.y - this.movementSpeed;
				break;
			case 'down':
				newy = this.y + this.movementSpeed;
				break;
			case 'left':
				newx = this.x - this.movementSpeed;
				break;
			case 'right':
				newx = this.x + this.movementSpeed;
				break;
		}

		if (newx >= 0 && newx <= 470) {
			this.x = newx;
		}

		if (newy >= 0 && newy <= 470) {
			this.y = newy;
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
