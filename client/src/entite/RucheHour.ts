import type { Entite } from "./Entite";

export default class RucheHour implements Entite {
    width: number=100;
    height: number=100;
    identifier: string = ""; // à remplir
    username: string = "Ruche Hour";
    x: number = 900;
    y: number = 400;
    movementSpeed: number = 3;
    health: number = 30;
    damage: number = 1;
    shootSpeed: number = 4;

    move(): void {
       // à remplir
    }
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health < 0) this.health = 0; // à modif pour display le mob + compter points 
    }

    getAsJson(): string {
        return JSON.stringify({
            id: this.identifier,
            name: this.username,
            pos: { x: this.x, y: this.y },
            hp: this.health
        });
    }
    toString(): string {
        return `${this.username} [HP: ${this.health}] is at ${this.x},${this.y}`;
    }
}