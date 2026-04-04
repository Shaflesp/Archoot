import Brainstorming from "../shared/Mob/Brainstorming.ts";
import type { Entite } from "../shared/Mob/Entite.ts";
import Galinette from "../shared/Mob/galinette.ts";
import LeTyrus from "../shared/Mob/LeTyrus.ts";
import Mygalomane from "../shared/Mob/Mygalomane.ts";
import Pie from "../shared/Mob/pie.ts";
import RucheHour from "../shared/Mob/RucheHour.ts";
import Spider from "../shared/Mob/spider.ts";
import { Bullet } from "../shared/Entity/Bullet.ts";
import type { Player } from "../shared/Entity/Player.ts";
import { Pool } from "../shared/Entity/Pool.ts";

export default class RoomState {
	boundWidth: number;
	boundHeight: number;

	players: Map<string, Player> = new Map();
	bulletPool: Pool<Bullet>;

	private allPools: Array<Pool<Entite>>;

	galinettePool: Pool<Galinette>;
	spiderPool: Pool<Spider>;
	piePool: Pool<Pie>;
	mygaloPool: Pool<Mygalomane>;
	ruchePool: Pool<RucheHour>;
	brainPool: Pool<Brainstorming>;
	tyrusPool: Pool<LeTyrus>;

	constructor(boundWidth: number, boundHeight: number) {
		this.boundWidth = boundWidth;
		this.boundHeight = boundHeight;
		this.bulletPool = new Pool(() => new Bullet(boundWidth, boundHeight), 300);

		this.galinettePool = new Pool(() => new Galinette(boundWidth, boundHeight), 20);
		this.spiderPool = new Pool(() => new Spider(boundWidth, boundHeight), 20);
		this.piePool = new Pool(() => new Pie(boundWidth, boundHeight), 20);

		this.mygaloPool = new Pool(() => new Mygalomane(boundWidth, boundHeight), 1);
		this.ruchePool = new Pool(() => new RucheHour(boundWidth, boundHeight), 1);
		this.brainPool = new Pool(() => new Brainstorming(boundWidth, boundHeight), 1);
		this.tyrusPool = new Pool(() => new LeTyrus(boundWidth, boundHeight), 1);

		this.allPools = [
			this.galinettePool,
			this.spiderPool,
			this.piePool,
			this.mygaloPool,
			this.ruchePool,
			this.brainPool,
			this.tyrusPool,
		];
	}

	getAllActiveMobs(): Array<Entite> {
		const mobs: Array<Entite> = [];
		this.allPools.forEach(pool => pool.getActive().forEach(m => mobs.push(m)));
		return mobs;
	}
}