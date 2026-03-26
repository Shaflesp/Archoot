import type { Player } from "../../../server/Entity/Player";
import type Bonus from "./Bonus";

export default class PotionDegats implements Bonus {
    power: number=1;
    img:string='/images/bonus/bonusRouge.png';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        // faire en sorte que les flèches octroient plus de dégats
    }

}