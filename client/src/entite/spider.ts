import { flushCompileCache } from "module";
import type { Entite } from "./Entite";

export default class Spider implements Entite {
    identifier: string = "";
    username: string = "araignée";
    x: number = Math.random()*1600;
    y: number = 0;
    movementSpeed: number = 2;
    health: number = 5;
    damage: number = 1;
    shootSpeed: number = 0;
    climb:boolean=false; // à modifier 

    constructor(){
        // mettre en place un random pour mettre 1 des 4 araignées dans img
    }

    move(): void {
                if(!this.climb){
            this.y+=3;
            if(this.y>=800){
                this.y=800;
                this.climb=true
            }
        }else if(this.climb){
            this.y-=2;
            if (this.y <= 0){
                this.y=0;
                this.climb=false;
            }
        }
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