import type { Server } from 'socket.io';
import type RoomState from "./RoomState";
import type { Player } from './Entity/Player.ts';
import type { Entite } from '../client/src/entite/Entite.ts';
import type { Pool } from './Entity/Pool.ts';
import Bonus from "../client/src/bonus/Bonus.ts";
import PotionDegats from "../client/src/bonus/PotionDegats.ts";
import PotionSoin from "../client/src/bonus/PotionSoin.ts";
import PotionRapidite from "../client/src/bonus/PotionRapidite.ts";
import PotionTirMultiple from "../client/src/bonus/PotionTirMultiple.ts";

const boundWidth: number = 1680;
const boundHeight: number = 800;

export default class GameManager {
	state: RoomState;
	io: Server;
	roomKey: string;
	bossSpawn: boolean = false;
	private readonly bossPoolMap: Map<string, Pool<Entite>>;
	level: number = 1;
	difficulty: number = 1;
	cycleStartScore: number = 0;
	activeBonuses: Bonus[] = [];

	constructor(state: RoomState, io: Server, roomKey: string) {
		this.state = state;
		this.io = io;
		this.roomKey = roomKey;
		this.bossPoolMap = new Map<string, Pool<Entite>>([
			['Mygalomane', this.state.mygaloPool],
			['Ruche Hour', this.state.ruchePool],
			['Brainstorming', this.state.brainPool],
			['Le Tyrus', this.state.tyrusPool],
		]);
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

		const cycleScore = this.getTotalScore() - this.cycleStartScore;
		const scale = this.difficulty;

		if (this.level === 1) {
			/* NIVEAU 1 : araignées + boss Mygalo */
			if (cycleScore < 500 * scale) {
				this.spawnMultiple(() => this.safeAcquire(this.state.spiderPool));
			} else {
				this.spawnBoss('Mygalomane');
			}
		} else if (this.level === 2) {
			/* NIVEAU 2 : Galinette + Ruche Hour */
			if (cycleScore < 1500 * scale) {
				this.spawnMultiple(() => this.safeAcquire(this.state.galinettePool));
			} else {
				this.spawnBoss('Ruche Hour');
			}
		} else if (this.level === 3) {
			/* NIVEAU 3 : pie + Brainstorming */
			if (cycleScore < 2500 * scale) {
				this.spawnMultiple(() => this.safeAcquire(this.state.piePool));
			} else {
				this.spawnBoss('Brainstorming');
			}
		} else if (this.level === 4) {
			/* NIVEAU 4 : tous + le tyrus */
			if (cycleScore < 3500 * scale) {
				this.spawnMultiple(() => this.safeAcquire(this.getRandomMobPool()));
			} else {
				this.spawnBoss('Le Tyrus');
			}
		}
	}

	getRandomMobPool(): Pool<Entite> {
		const rand: number = Math.random();

		if (rand < 0.3) {
			return this.state.spiderPool;
		} else if (rand < 0.6) {
			return this.state.galinettePool;
		} else {
			return this.state.piePool;
		}
	}

	private spawnMultiple(spawner: () => void) {
		const count = Math.min(this.difficulty, 3); // cap at 3 per tick
		for (let i = 0; i < count; i++) {
			spawner();
		}
	}

	/* spawn du boss + notif console et boolean */
	spawnBoss(name: string) {
		if (this.bossSpawn) return;

		this.clearMobs();
		const boss = this.bossPoolMap.get(name)?.acquire();
		if (!boss) return;

		boss.speed = boss.baseSpeed * this.difficulty;
		boss.movementSpeed = boss.baseMovementSpeed * this.difficulty;
		boss.health = boss.health * this.difficulty;
		boss.maxHp = boss.health;

		this.bossSpawn = true;
		this.io.to(this.roomKey).emit('boss-warning', {
			x: boss.x,
			y: boss.y,
			width: boss.width,
			height: boss.height,
			name: boss.name,
		});

		boss.active = false;

		setTimeout(() => {
			boss.active = true;
			console.log(`Boss en cours : ${boss.name}`);
		}, 3000);
	}

	isBoss(name: string): boolean {
		return ['Mygalomane', 'Brainstorming', 'Ruche Hour', 'Le Tyrus'].includes(
			name
		);
	}

	/* màj des variables quand boss tué */
	bossDead() {
		this.bossSpawn = false;
		this.clearMobs();
		console.log('Boss tué ! Gain de niveau');

		const nbPotions = Math.floor(Math.random() * 3) + 2; // entre 2 et 4 potions à générer
		const typesPotions = [
			PotionDegats,
			PotionSoin,
			PotionRapidite,
			PotionTirMultiple,
		];

		for (let i = 0; i < nbPotions; i++) {
			const RandomP =
				typesPotions[Math.floor(Math.random() * typesPotions.length)]; // => type de potion en, aléa
			const x = boundWidth / 2 + 50 * i; // pour décallé les potions
			const y = boundHeight / 2 + 10 * i; // idem

			const p = new RandomP(x, y);
			p.active = true;
			this.activeBonuses.push(p);
		}

		if (this.level < 4) {
			this.level++;
		} else {
			this.level = 1;
			this.difficulty++;
			this.cycleStartScore = this.getTotalScore();
			console.log(`Nouveau cycle ! Difficulté: ${this.difficulty}`);
		}
	}

	/* pour faire dispawn les mobs pdt un boss */
	clearMobs() {
		this.state.getAllActiveMobs().forEach(m => (m.active = false));
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

	getAllActiveBonuses(): Bonus[] {
		return this.activeBonuses.filter(b => b.active);
	}

	//C'est effrayant, je sais, mais en fait ça dis juste que l'on cherche pour n'importe quel mob héritant d'Entite
	private safeAcquire<T extends Entite>(pool: Pool<T>): T | null {
		const mob = pool.acquire();
		if (!mob) return null;

		mob.speed = mob.baseSpeed * this.difficulty;
		mob.movementSpeed = mob.baseMovementSpeed * this.difficulty;
		mob.health = mob.health * this.difficulty;
		mob.maxHp = mob.health;

		const activePlayers = Array.from(this.state.players.values()).filter(
			p => p.active
		);

		let attempts = 0;
		const maxAttempts = 10;

		while (attempts < maxAttempts) {
			const overlaps = activePlayers.some(p => p.collidesWith(mob));
			if (!overlaps) break;

			mob.reset();
			attempts++;
		}

		if (attempts === maxAttempts) {
			mob.active = false;
			return null;
		}

		return mob;
	}
}