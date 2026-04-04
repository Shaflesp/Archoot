import type { Player } from "../Entity/Player";
import Bonus from "./Bonus.ts";

export default class PotionRapidite extends Bonus{
    power:number= 2;
    img: string = '/images/bonus/bonusBleu.png';
    name = 'PotionRapidite';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        player.movementSpeed+=this.power;
        this.active=false;
    }
}