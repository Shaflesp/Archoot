import type { Entite } from "./Entite";

export default class RucheHour implements Entite {
    speed: number = 0;
    width: number=100;
    height: number=100;
    name: string = "Ruche Hour";
    x: number = 900;
    y: number = 400;
    movementSpeed: number = 3;
    health: number = 30;
    damage: number = 1;
    shootSpeed: number = 4;

    move(): void {
        this.x-=this.speed;
    }
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health < 0) this.health = 0; // à modif pour display le mob + compter points 
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
        return `${this.name} [HP: ${this.health}] is at ${this.x},${this.y}`;
    }
}