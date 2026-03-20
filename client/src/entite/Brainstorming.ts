import type { Entite } from "./Entite";

export default class Brainstorming implements Entite {
    width: number = 50;
    height: number = 50;
    name: string = "Brainstorming";
    x: number = 0;
    y: number = 0;
    movementSpeed: number = 2;
    health: number = 15;
    damage: number = 2;
    shootSpeed: number = 1;
    speed:number = 2;

    move(): void {
        this.x -= this.speed;
    }
    takeDamage(amount: number): void { this.health -= amount; }
        
    getAsJson() {         
         return {
			name: this.name,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		};
    }

    toString(): string { return `${this.name} (HP: ${this.health})`; }
}