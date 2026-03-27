import type { Player } from "../../../server/Entity/Player";
 import Bonus from "./Bonus.ts";

export default class PotionTirRapide extends Bonus {
    power: number =2;
    img: string = '/images/bonus/bonusJaune.png';
    name = 'PotionTirRapide';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        this.active=false;
    }
}