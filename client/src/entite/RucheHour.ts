import Entite from "./Entite";

export default class RucheHour extends Entite {
    identifier: string;
    username: string;
    x: number;
    y: number;
    movementSpeed: number;
    health: number;
    damage: number;
    shootSpeed: number;

    constructor(){
        this.identifier="";
        this.username="Ruche Hour";
        this.x=900;
        this.y=400;
        this.movementSpeed=3;
        this.health=25;
        this.damage=1;
        this.shootSpeed=4;
    }

    move(direction: string): void {
        let newx = this.x;
		let newy = this.y;

		switch (direction) {
			case 'up':
				newy = this.y - this.movementSpeed;
				break;
			case 'down':
				newy = this.y + this.movementSpeed;
				break;
			case 'left':
				newx = this.x - this.movementSpeed;
				break;
			case 'right':
				newx = this.x + this.movementSpeed;
				break;
		}
		if (newx >= 0 && newx <= 470) {
			this.x = newx;
		}

		if (newy >= 0 && newy <= 470) {
			this.y = newy;
		}
    }

    getAsJson(): string {
        return {
            identifier
        }
    }
    takeDamage(): void {
        throw new Error("Method not implemented.");
    }
    healing(heart: number): void {
        throw new Error("Method not implemented.");
    }
    changeShootSpeed(newSpeed: number): void {
        throw new Error("Method not implemented.");
    }
    changeMovementSpeed(speedBonus: number): void {
        throw new Error("Method not implemented.");
    }
    changeDamage(damageBonus: number): void {
        throw new Error("Method not implemented.");
    }

    toString(): string {
        
    }

}