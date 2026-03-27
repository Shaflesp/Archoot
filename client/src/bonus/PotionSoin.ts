import type { Player } from "../../../server/Entity/Player";
import Bonus from "./Bonus.ts";

export default class PotionSoin extends Bonus {
    power: number=1;
    img: string = '/images/bonus/bonusVerte.png';
    name = 'PotionSoin';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        player.lives+=this.power;
        this.active=false;
    }
}