import type { Entite } from "./Entite";

export default class Mygalomane implements Entite{
    identifier: string=""; 
    username:string="Darognée";
    x: number=900
    y: number=400
    movementSpeed: number=0;
    health: number=25;
    damage: number=1;
    shootSpeed: number=3;
    
    move(): void {
        
    }
    takeDamage(amount: number): void {
         this.health-=amount; 
    }

    getAsJson(): string {         
         return JSON.stringify({
            id: this.identifier,
            name: this.username,
            pos: { x: this.x, y: this.y },
            hp: this.health
        });
    }

    toString(): string { return `${this.username} (HP: ${this.health})`; }

}