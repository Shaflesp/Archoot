import Bonus from '../../../../shared/Bonus/Bonus.ts';
import type { Player } from '../../../../shared/Entity/Player';

export class MockBonus extends Bonus {
	name = 'mockBonus';
	power = 5;
	img = 'mock.png';

	giveBonus(player: Player): void {
		player.bonusList.push(this);
		player.damage += this.power;
		this.active = false;
	}
}
