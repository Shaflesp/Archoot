import type { Entite } from "./Entite";

export default class Spider implements Entite {
    name: string = "araignée";
    x: number = Math.random()*1600;
    y: number = 0;
    movementSpeed: number = 2;
    health: number = 5;
    damage: number = 1;
    shootSpeed: number = 0;
    climb:boolean=false; // à modifier 
    width: number = 50;
    height: number = 50;
    speed: number = 0;

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