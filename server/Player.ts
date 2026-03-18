export class Player {
	movementSpeed: number;
	x: number;
	y: number;
	width: number;
    height: number;
	username: string;
	identifier: string;

	constructor(id: string, username: string) {
		this.movementSpeed = 5;
		this.x = 0;
		this.y = 0;
		this.width = 30; //a ajuster selon la taille que l'on veut pour la hitbox
        this.height = 30; //Pour le moment j'ai mis pareil que le sprite (voir GameView)
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

	collidesWith(other: Player): boolean {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

	getAsJson() {
		return {
			identifier: this.identifier,
			username: this.username,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};
	}
}
