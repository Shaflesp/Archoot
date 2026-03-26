import Brainstorming from "../client/src/entite/Brainstorming.ts";
import type { Entite } from "../client/src/entite/Entite.ts";
import Galinette from "../client/src/entite/galinette.ts";
import LeTyrus from "../client/src/entite/LeTyrus.ts";
import Mygalomane from "../client/src/entite/Mygalomane.ts";
import Pie from "../client/src/entite/pie.ts";
import RucheHour from "../client/src/entite/RucheHour.ts";
import Spider from "../client/src/entite/spider.ts";
import { Bullet } from "./Entity/Bullet.ts";
import type { Player } from "./Entity/Player.ts";
import { Pool } from "./Entity/Pool.ts";

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

	cachedPayload: {
        players: { [id: string]: object };
        bullets: object[];
    } = { players: {}, bullets: [] };

	cachedMobsPayload: { mobs: object[] } = { mobs: [] };

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

	updatePlayerCache(player: Player) {
        this.cachedPayload.players[player.identifier] = player.getAsJson();
    }

    removePlayerCache(identifier: string) {
        delete this.cachedPayload.players[identifier];
    }

    updateBulletCache() {
        this.cachedPayload.bullets = this.bulletPool.getActive().map(b => b.getAsJson());
    }

	updateMobsCache(mobs: Array<Entite>) {
		this.cachedMobsPayload.mobs = mobs.map(m => m.getAsJson());
	}
}