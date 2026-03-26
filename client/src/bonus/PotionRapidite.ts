import type { Player } from "../../../server/Entity/Player";
import type Bonus from "./Bonus";

export default class PotionRapidite implements Bonus{
    power:number= 2;
    img: string = '/images/bonus/bonusBleu.png';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        player.movementSpeed+=this.power;
    }
}