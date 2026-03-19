import type { Entite } from "./Entite";

export default class Spider implements Entite {
    identifier: string = "";
    username: string = "galinette cendrée";
    x: number = 0;
    y: number = 0;
    movementSpeed: number = 2;
    health: number = 5;
    damage: number = 1;
    shootSpeed: number = 0; // à modifier 

    constructor(){
        // mettre en place un random pour mettre 1 des 4 araignées dans img
    }

    move(): void {}
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