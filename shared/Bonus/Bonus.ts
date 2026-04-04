import type { Player } from "../Entity/Player"

export default abstract class Bonus {
    x: number;
    y: number;
    width: number = 50;
    height: number = 50;
    active: boolean =false;
    
    abstract name:string;
    abstract power: number;
    abstract img: string;
    
    constructor(x:number, y:number){
        this.x=x;
        this.y=y;
    }

    abstract giveBonus(player: Player): void;

    getAsJSON(){
        return {
			name: this.name,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			img: this.img,
		};
    }
}