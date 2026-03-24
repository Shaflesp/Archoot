import type { Entite } from "../client/src/entite/Entite.ts";
import Galinette from "../client/src/entite/galinette.ts";
import Mygalomane from "../client/src/entite/Mygalomane.ts";
import Pie from "../client/src/entite/pie.ts";
import Spider from "../client/src/entite/spider.ts";
import { Bullet } from "./Entity/Bullet.ts";
import type { Player } from "./Entity/Player.ts";
import { Pool } from "./Entity/Pool.ts";

const boundWidth = 1680;
const boundHeight = 800;

export default class RoomState {
    players: Map<string, Player> = new Map();
    bulletPool: Pool<Bullet> = new Pool(() => new Bullet(boundWidth, boundHeight), 100);

    galinettePool: Pool<Galinette> = new Pool(() => new Galinette(), 20);
    spiderPool: Pool<Spider> = new Pool(() => new Spider(), 20);
    piePool: Pool<Pie> = new Pool(() => new Pie(), 20);
    bossPool: Pool<Mygalomane> = new Pool(() => new Mygalomane(), 1); 

    /* gestion niveau difficulté : */
    level: number = 1;

    getAllActiveMobs(): Array<Entite> {
        //il faut trouver une manière moins hardcodée
        return ([] as Array<Entite>)
            .concat(this.spiderPool.getActive())
            .concat(this.piePool.getActive())
            .concat(this.galinettePool.getActive())
            .concat(this.bossPool.getActive());
    }

    // spawnMob() {
        // const roll = Math.floor(Math.random() * 3); //là pareil
        // if (roll === 0) this.galinettePool.acquire();
        // else if (roll === 1) this.spiderPool.acquire();
        // else this.piePool.acquire();
    // }
}