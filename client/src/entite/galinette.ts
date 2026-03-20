import type { Entite } from "./Entite";

export default class Galinette implements Entite {
    width: number= 50;
    height: number= 50;
    speed: number = 2;
    identifier: string = "";
    username: string = "galinette cendrée";
    x: number = 0;
    y: number = 0;
    movementSpeed: number = 2;
    health: number = 5;
    damage: number = 1;
    shootSpeed: number = 0; // à modifier 

    move(): void {
        this.x-=this.speed;
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