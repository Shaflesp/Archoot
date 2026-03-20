import type { Entite } from "./Entite";

export default class LeTyrus implements Entite{
    width: number = 50;
    height: number = 50;
    speed: number = 1;
    name:string="Le Tyrus";
    x: number=900
    y: number=400
    movementSpeed: number=0;
    health: number=25;
    damage: number=1;
    shootSpeed: number=3;

    move(): void {
        this.x-=this.speed;
    }
    
    takeDamage(amount: number): void {
         this.health-=amount; 
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

    toString(): string { return `${this.name} (HP: ${this.health})`; }
}