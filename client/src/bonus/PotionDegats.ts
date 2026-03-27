import type { Player } from "../../../server/Entity/Player";
import Bonus from "./Bonus.ts";

export default class PotionDegats extends Bonus {
    power: number=1;
    img:string='/images/bonus/bonusRouge.png';
    name: string= 'PotionDegats';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        // faire en sorte que les flèches octroient plus de dégats
        this.active=false;
    }

}