import type {Collidable} from "../../../server/Entity/Collidable.ts";

export abstract class Entite implements Collidable {
	boundWidth: number;
	boundHeight: number;

	active: boolean = false;

	abstract name: string;
	abstract x: number;
	abstract y: number;
	abstract width: number;
	abstract height: number;
	abstract health: number;
	abstract maxHp: number;

	abstract damage: number;
	abstract shootSpeed: number;

	abstract movementSpeed: number;
	abstract speed: number;
	abstract baseSpeed: number;
	abstract baseMovementSpeed: number;

	target: { x: number; y: number } | null = null;

	constructor(boundWidth: number, boundHeight: number) {
		this.boundWidth = boundWidth;
		this.boundHeight = boundHeight;
	}

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
			speed: this.speed,
			dx: this.target ? this.target.x - this.x : -1,
			dy: this.target ? this.target.y - this.y : 0,
			hp: this.health,
			maxHp: this.maxHp,
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

	needsTarget(): boolean {
		return false;
	}
}