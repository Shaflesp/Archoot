import type { Player } from "../../../server/Entity/Player"

export default interface Bonus {
    power:number
    img:string;
    
    giveBonus(player:Player):void;
}