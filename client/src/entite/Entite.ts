export abstract class Entite {
	abstract name: string;
	abstract x: number;
	abstract y: number;
	abstract width: number;
	abstract height: number;
	abstract movementSpeed: number;
	abstract health: number;
	abstract damage: number;
	abstract shootSpeed: number;
	abstract speed: number;

	abstract move(): void;

	takeDamage(amount: number): void {
		this.health -= amount;
	}

	getAsJson() {
		return {
			name: this.name,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};
	}

	toString(): string {
		return `${this.name} (HP: ${this.health})`;
	}
}
