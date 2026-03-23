import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './Entity/Player.ts'
import { Bullet } from './Entity/Bullet.ts';
import { Pool } from './Entity/Pool.ts';

import type { Entite } from '../client/src/entite/Entite.ts';
import Spider from '../client/src/entite/spider.ts';
import Pie from '../client/src/entite/pie.ts';
import Galinette from '../client/src/entite/galinette.ts';

const httpServer = http.createServer((_req, res) => {
	res.statusCode = 200;
});

const boundWidth: number = 1680;
const boundHeight: number = 800;

const players = new Map<string, Player>();
const bulletPool = new Pool(() => new Bullet(boundWidth, boundHeight), 100);

const mobsTypes = ['spider', 'pie', 'galinette'];
const galinettePool = new Pool(() => new Galinette(),20)
const spiderPool = new Pool(() => new Spider(), 20);
const piePool = new Pool(() => new Pie(), 20);

const port = 8080;
httpServer.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}.`);
});

const io = new IOServer(httpServer, { cors: { origin: true } });

io.on('connection', socket => {
	socket.on('register', (data: { username: string }) => {
		const username = data.username?.trim();

		if (!username || username.length < 2) {
			socket.emit('register_error', 'Invalid username.');
			return;
		}

		const isTaken = Array.from(players.values()).some(
			p => p.username === username
		);

		if (isTaken) {
			socket.emit('register_error', 'Username already taken.');
			return;
		}

		players.set(socket.id, new Player(socket.id, username, boundWidth, boundHeight));
		console.log(`Player registered: ${username} (${socket.id})`);
		socket.emit('register_success');
		broadcast();
	});

	socket.on('keypress', direction => {
		const player = players.get(socket.id);

		if (!player || player.isDead()) { return;}

		const prevX = player.x;
    	const prevY = player.y;

		player.move(direction);
		console.log(`${player.username} moved ${direction} → (${player.x}, ${player.y})`);

		const collides = Array.from(players.values()).some(
			other => other.identifier !== player.identifier && player.collidesWith(other)
		);
	
		if (collides) {
			player.x = prevX;
			player.y = prevY;
		}

		if (player.x !== prevX || player.y !== prevY) {
			broadcast();
		}
	});

	socket.on('shoot', (data: { dx: number; dy: number }) => {
		const player = players.get(socket.id);
		if (!player || player.isDead()) return;

		const bullet = bulletPool.acquire();
		if (!bullet) return;

		bullet.fire(
			player.x + player.width / 2,
			player.y + player.height / 2,
			data.dx,
			data.dy,
			player.identifier
		);

		broadcast();
	});


	function removePlayer(socketId: string) {
		const player = players.get(socketId);
		if (player) {
			console.log(`${player.username} left.`);
			players.delete(socketId);
			broadcast();
		}
	}

	socket.on('player-leave', () => removePlayer(socket.id));
	socket.on('disconnect', () => removePlayer(socket.id));
});

function getAllActiveMobs(): Array<Entite> {
	return ([] as Array<Entite>)
		.concat(spiderPool.getActive())
		.concat(piePool.getActive())
		.concat(galinettePool.getActive());
}

function spawnMobs() {
	const roll = Math.floor(Math.random() * mobsTypes.length);
	switch (roll) {
		case 0: galinettePool.acquire(); break;
		case 1: spiderPool.acquire(); break;
		case 2: piePool.acquire(); break;
		default: break;
	}
}

function broadcast() {
    const playerInfo: Map<string, object> = new Map();
    players.forEach(p => playerInfo.set(p.identifier, p.getAsJson()));
    io.emit('playerInfo', {
			players: Object.fromEntries(playerInfo),
			bullets: bulletPool.getActive().map(b => b.getAsJson()),
		});
}

function broadcastMob() {
	const mobsInfo: object[] = [];
	getAllActiveMobs().forEach(m => mobsInfo.push(m.getAsJson()));
	io.emit('mobsInfo', { mobs: mobsInfo });
}

setInterval(() => {
	const activeMobs = getAllActiveMobs();

	// --- Bullets ---
	const activeBefore = bulletPool.getActive().length;
	bulletPool.updateAll();
	let changed = activeBefore !== bulletPool.getActive().length;

	bulletPool.getActive().forEach(bullet => {
		players.forEach(player => {
			if (player.identifier === bullet.ownerId) return;
			if (player.collidesWith(bullet)) {
				player.takeDamage(1);
				bullet.active = false;
				changed = true;

				if (player.isDead()) {
					console.log(`${player.username} was eliminated.`);
				}
			}
		});

		activeMobs.forEach( mob => {
			if (mob.collidesWith(bullet)) {
				mob.takeDamage(1);
				bullet.active = false;
				changed = true;
				console.log(`${mob.name} hit, HP: ${mob.health}`);

				if (mob.isDead()) {
					console.log(`${mob.name} eliminated.`);
					mob.active = false;
				}
			}
		});
	});

	// --- Mobs ---
	if (activeMobs.length > 0) {
		activeMobs.forEach(mob => {
			if(mob instanceof Pie){
				const targetPlayer = getClosestPlayer(mob, players);

				mob.target = targetPlayer?{x: targetPlayer.x, y: targetPlayer.y}:null; 
			}
			
			mob.move();

			players.forEach(player => {
				if (player.collidesWith(mob)) {
					player.takeDamage(mob.damage);
					changed = true;
					if (player.isDead()) {
						console.log(`${player.username} was eliminated.`);
					}
				}
			});

			if (mob.x < -mob.width) {
				mob.active = false;
			}
		});
	}

	if (changed || activeMobs.length > 0) {
		broadcast();
		broadcastMob();
	}

}, 1000 / 60);

setInterval(() => {
	spawnMobs();
}, 2000);

function getClosestPlayer(mob: Entite, players: Map<string, Player>):Player | null{
	const activePlayers = Array.from(players.values()).filter(p => p.active); 

	if(activePlayers.length===0) return null;

	let closest = activePlayers[0];
	let minDistance = Math.hypot(closest.x - mob.x, closest.y - mob.y);

	for(let i = 1; i<activePlayers.length; i++){
		const p = activePlayers[i];
		const d= Math.hypot(p.x - mob.x, p.y - mob.y);

		if(d<minDistance) {
			minDistance = d;
			closest = p;
		}
	}
	return closest; 
}