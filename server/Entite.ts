export default interface Entite {
    identifier:string;
    username:string;
    x:number;
    y:number;
    movementSpeed:number;
    health:number;
    damage:number;
    shootSpeed:number;

    move(direction:string):void; 
    getAsJson():string;
    takeDamage():void;
    healing(heart:number):void;
    changeShootSpeed(newSpeed:number):void; 
    changeMovementSpeed(speedBonus:number):void;
    changeDamage(damageBonus:number):void; 
}