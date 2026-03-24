import type RoomState from "./RoomState";
import type { Player } from './Entity/Player.ts';
import type { Entite } from '../client/src/entite/Entite.ts';
import type { Pool } from './Entity/Pool.ts';

export default class GameManager {
	state: RoomState;
	bossSpawn: boolean = false;
	level: number = 1;

	constructor(state: RoomState) {
		this.state = state;
	}

	/* Avoir score total de tous les joueurs d'une room */
	getTotalScore(): number {
		let total = 0;
		this.state.players.forEach(p => (total += p.score));
		return total;
	}

	spawnMob() {
		if (this.state.players.size === 0) return; // si aucun joueur, on ff
		if (this.bossSpawn) return;

		const score = this.getTotalScore();

		if (this.level === 1) {
			/* NIVEAU 1 : araignées + boss Mygalo */
			score < 500
				? this.state.spiderPool.acquire()
				: this.spawnBoss('Mygalomane');

		} else if (this.level === 2) {
			/* NIVEAU 2 : Galinette + Ruche Hour */
			score < 1500
				? this.state.galinettePool.acquire()
				: this.spawnBoss('Ruche Hour');
		} else if (this.level === 3) {
			/* NIVEAU 3 : pie + Brainstorming */
			score < 2500
				? this.state.piePool.acquire()
				: this.spawnBoss('Brainstorming');
		} else if (this.level === 4) {
			/* NIVEAU 4 : tous + le tyrus */
			score < 3500 ? this.state.piePool.acquire() : this.spawnBoss('Le Tyrus');
		}
	}

	/* spawn du boss + notif console et boolean */
	spawnBoss(name: string) {
		if (this.bossSpawn) return; // si déjà boss on annule
		this.clearMobs();

		const bossPool: Map<string, Pool<Entite>> = new Map([
			['Mygalomane',   this.state.mygaloPool],
			['Ruche Hour',   this.state.ruchePool],
			['Brainstorming', this.state.brainPool],
			['Le Tyrus',     this.state.tyrusPool],
		]);

		const boss = bossPool.get(name)?.acquire();
		if (boss) {
			this.bossSpawn = true;
			console.log(`Boss en cours : ${boss.name}`);
		}
	}

	isBoss(name: string): boolean {
		return ['Mygalomane', 'Brainstorming', 'Ruche Hour', 'Le Tyrus'].includes(name);
	}

	/* màj des variables quand boss tué */
	bossDead() {
		this.bossSpawn = false;
		this.level++;
		console.log('Boss tué ! Gain de niveau');
	}

	/* pour faire dispawn les mobs pdt un boss */
	clearMobs() {
		this.state.getAllActiveMobs().forEach(m => m.active = false);
	}

	getClosestPlayer(mob: Entite): Player | null {
		const activePlayers = Array.from(this.state.players.values()).filter(
			p => p.active
		);
		if (activePlayers.length === 0) return null;

		let closest = activePlayers[0];
		let minDistance = Math.hypot(closest.x - mob.x, closest.y - mob.y);

		for (let i = 1; i < activePlayers.length; i++) {
			const p = activePlayers[i];
			const d = Math.hypot(p.x - mob.x, p.y - mob.y);
			if (d < minDistance) {
				minDistance = d;
				closest = p;
			}
		}
		return closest;
	}
}