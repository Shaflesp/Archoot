import type { Player } from "../../../server/Entity/Player";
import type Bonus from "./Bonus";

export default class PotionSoin implements Bonus {
    power: number=1;
    img: string = '/images/bonus/bonusVerte.png';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        player.lives+=this.power;
    }

}