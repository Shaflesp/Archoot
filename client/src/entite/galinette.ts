import type { Entite } from "./Entite";

export default class Galinette implements Entite {
    width: number= 50;
    height: number= 50;
    speed: number = 2;
    name: string = "galinette cendrée";
    x: number = 1600;
    y: number = Math.random()*600;
    movementSpeed: number = 2;
    health: number = 5;
    damage: number = 1;
    shootSpeed: number = 0; // à modifier 

    move(): void {
        this.x-=this.speed;
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