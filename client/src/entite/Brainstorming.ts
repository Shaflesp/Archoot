import type { Entite } from "./Entite";

export default class Brainstorming implements Entite {
    width: number = 50;
    height: number = 50;
    identifier: string =""; // à remplir
    username: string = "Brainstorming";
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