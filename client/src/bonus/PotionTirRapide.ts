import type { Player } from "../../../server/Entity/Player";
import type Bonus from "./Bonus";

export default class PotionTirRapide implements Bonus {
    power: number =2;
    img: string = '/images/bonus/bonusJaune.png';

    giveBonus(player: Player): void {
        player.bonusList.push(this);
        
    }


}