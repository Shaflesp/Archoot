import type {Collidable} from "../../../server/Entity/Collidable.ts";

export abstract class Entite implements Collidable {
	active: boolean = false;

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
	abstract target: {x:number, y:number} | null
	
	abstract move(): void;

	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}

	isDead(): boolean {
		return this.health <= 0;
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

	collidesWith(other: Collidable): boolean {
		return (
			this.x < other.x + other.width &&
			this.x + this.width > other.x &&
			this.y < other.y + other.height &&
			this.y + this.height > other.y
		);
	}

	abstract reset(): void;
}