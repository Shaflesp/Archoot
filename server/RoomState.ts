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

const boundWidth = 1680;
const boundHeight = 800;

export default class RoomState {
    players: Map<string, Player> = new Map();
    bulletPool: Pool<Bullet> = new Pool(() => new Bullet(boundWidth, boundHeight), 100);

    galinettePool: Pool<Galinette> = new Pool(() => new Galinette(), 20);
    spiderPool: Pool<Spider> = new Pool(() => new Spider(), 20);
    piePool: Pool<Pie> = new Pool(() => new Pie(), 20);
    mygaloPool: Pool<Mygalomane> = new Pool(() => new Mygalomane(), 1); 
    ruchePool = new Pool(() => new RucheHour(), 1);
    brainPool = new Pool(() => new Brainstorming(), 1);
    tyrusPool = new Pool(()=> new LeTyrus(), 1);

    /* gestion niveau difficulté : */
    level: number = 1;

    getAllActiveMobs(): Array<Entite> {
        //il faut trouver une manière moins hardcodée
        return ([] as Array<Entite>)
            .concat(this.spiderPool.getActive())
            .concat(this.piePool.getActive())
            .concat(this.galinettePool.getActive())
            .concat(this.mygaloPool.getActive())
            .concat(this.ruchePool.getActive())
            .concat(this.brainPool.getActive())
            .concat(this.tyrusPool.getActive());
    }
}