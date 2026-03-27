import type { Player } from "../../../server/Entity/Player.ts";
 import Bonus from "./Bonus.ts";

export default class PotionTirMultiple extends Bonus {
    power: number =1;
    img: string = '/images/bonus/bonusJaune.png';
    name = 'PotionTirRapide';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        player.arrowsPerClick += this.power;
        this.active=false;
    }
}