import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './Entity/Player.ts';
import { Bullet } from './Entity/Bullet.ts';
import { Pool } from './Entity/Pool.ts';

import type { Entite } from '../client/src/entite/Entite.ts';
import Spider from '../client/src/entite/spider.ts';
import Pie from '../client/src/entite/pie.ts';
import Galinette from '../client/src/entite/galinette.ts';
import type { RoomServer } from './RoomServer.ts';

const httpServer = http.createServer((_req, res) => {
	res.statusCode = 200;
});

const boundWidth: number = 1680;
const boundHeight: number = 800;

class RoomState {
	players: Map<string, Player> = new Map();
	bulletPool: Pool<Bullet> = new Pool(() => new Bullet(boundWidth, boundHeight), 100);

	galinettePool: Pool<Galinette> = new Pool(() => new Galinette(), 20);
	spiderPool: Pool<Spider> = new Pool(() => new Spider(), 20);
	piePool: Pool<Pie> = new Pool(() => new Pie(), 20);

	getAllActiveMobs(): Array<Entite> {
		//il faut trouver une manière moins hardcodée
		return ([] as Array<Entite>)
			.concat(this.spiderPool.getActive())
			.concat(this.piePool.getActive())
			.concat(this.galinettePool.getActive());
	}

	spawnMob() {
		const roll = Math.floor(Math.random() * 3); //là pareil
		if (roll === 0) this.galinettePool.acquire();
		else if (roll === 1) this.spiderPool.acquire();
		else this.piePool.acquire();
	}
}

const rooms = new Map<number, RoomServer>();
const roomStates = new Map<number, RoomState>();
let roomIdCpt = 0;

function createRoom(name: string, capacityMax: number, solo: boolean = false): RoomServer {
	const r: RoomServer = {
		id: ++roomIdCpt,
		name,
		capacityMax,
		players: new Set(),
		solo
	};
	rooms.set(r.id, r);
	roomStates.set(r.id, new RoomState());
	return r;
}

createRoom('Bleu', 4);
createRoom('Blanc', 4);
createRoom('Vert', 4);
createRoom('Orange', 4);
createRoom('Rouge', 4);
createRoom('Jaune', 4);
createRoom('Coconut [DO NOT DELETE]', 4);

const port = 8080;
httpServer.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}.`);
});

const io = new IOServer(httpServer, { cors: { origin: true } });

function broadcastRooms(target: { emit: Function } = io) {
	const roomList = Array.from(rooms.values())
	.filter(r => !r.solo)
	.map(r => ({
		roomId: r.id,
		roomName: r.name,
		capacityMax: r.capacityMax,
		currentPlayers: r.players.size,
	}));

	target.emit('update-rooms', { rooms: roomList });
}

function getRoomKey(roomId: number): string {
	return `room-${roomId}`;
}

function broadcastGame(roomId: number, state: RoomState) {
	const playerInfo: Map<string, object> = new Map();
	state.players.forEach(p => playerInfo.set(p.identifier, p.getAsJson()));
	io.to(getRoomKey(roomId)).emit('playerInfo', {
		players: Object.fromEntries(playerInfo),
		bullets: state.bulletPool.getActive().map(b => b.getAsJson()),
	});
}

function broadcastMobs(roomId: number, state: RoomState) {
	const mobsInfo: object[] = [];
	state.getAllActiveMobs().forEach(m => mobsInfo.push(m.getAsJson()));
	io.to(getRoomKey(roomId)).emit('mobsInfo', { mobs: mobsInfo });
}

function getClosestPlayer(mob: Entite, players: Map<string, Player>): Player | null {
	const activePlayers = Array.from(players.values()).filter(p => p.active);
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

io.on('connection', socket => {
	broadcastRooms();

	let currentRoomId: number | null = null;

	socket.on('get-rooms', () => {
		broadcastRooms(socket);
	});


	socket.on('register', (data: { username: string }) => {
		const username = data.username?.trim();

		if (!username || username.length < 2) {
			socket.emit('register_error', 'Invalid username.');
			return;
		}

		const isTaken = Array.from(roomStates.values()).some(state =>
			Array.from(state.players.values()).some(p => p.username === username)
		);

		if (isTaken) {
			socket.emit('register_error', 'Username already taken.');
			return;
		}

		socket.data.username = username;
		socket.emit('register_success');
	});

	socket.on('join-room', (roomId: number) => {
		const room = rooms.get(roomId);
		const state = roomStates.get(roomId);

		if (!room || !state) {
			socket.emit('room_error', 'Room not found.');
			return;
		}

		if (room.players.size >= room.capacityMax) {
			socket.emit('room_error', 'Room is full.');
			return;
		}

		if (currentRoomId !== null) {
			removeFromRoom(currentRoomId);
		}

		const username = socket.data.username as string | undefined;
		if (!username) {
			socket.emit('room_error', 'You must register before joining a room.');
			return;
		}

		currentRoomId = roomId;
		room.players.add(socket.id);
		socket.join(getRoomKey(roomId));

		state.players.set(
			socket.id,
			new Player(socket.id, username, boundWidth, boundHeight)
		);
		console.log(`${socket.id} joined room ${room.name}`);

		broadcastRooms();
		socket.emit('join-room-success', roomId);
		broadcastGame(roomId, state);
	});

	socket.on('create-solo-room', () => {
		const username = socket.data.username as string | undefined;
		if (!username) {
			socket.emit('room_error', 'You must register first.');
			return;
		}
	
		if (currentRoomId !== null) removeFromRoom(currentRoomId);
	
		const room = createRoom(`${username}'s game`, 1, true);
		const state = roomStates.get(room.id)!;
	
		currentRoomId = room.id;
		room.players.add(socket.id);
		socket.join(getRoomKey(room.id));
		state.players.set(socket.id, new Player(socket.id, username, boundWidth, boundHeight));
	
		console.log(`${username} created solo room ${room.id}`);
		socket.emit('join-room-success', room.id);

		broadcastGame(room.id, state);
	});

	socket.on('keypress', direction => {
		if (currentRoomId === null) return;
		const state = roomStates.get(currentRoomId);
		if (!state) return;

		const player = state.players.get(socket.id);
		if (!player || player.isDead()) return;

		const prevX = player.x;
		const prevY = player.y;

		player.move(direction);
		console.log(
			`${player.username} moved ${direction} → (${player.x}, ${player.y})`
		);

		const collides = Array.from(state.players.values()).some(
			other =>
				other.identifier !== player.identifier && player.collidesWith(other)
		);

		if (collides) {
			player.x = prevX;
			player.y = prevY;
		}

		if (player.x !== prevX || player.y !== prevY) {
			broadcastGame(currentRoomId, state);
		}
	});

	socket.on('shoot', (data: { dx: number; dy: number }) => {
		if (currentRoomId === null) return;
		const state = roomStates.get(currentRoomId);
		if (!state) return;

		const player = state.players.get(socket.id);
		if (!player || player.isDead()) return;

		const bullet = state.bulletPool.acquire();
		if (!bullet) return;

		bullet.fire(
			player.x + player.width / 2,
			player.y + player.height / 2,
			data.dx,
			data.dy,
			player.identifier
		);

		broadcastGame(currentRoomId, state);
	});

	function removeFromRoom(roomId: number) {
		const room = rooms.get(roomId);
		const state = roomStates.get(roomId);
		if (!room || !state) return;

		const player = state.players.get(socket.id);
		if (player) {
			console.log(`${player.username} left room ${room.name}.`);
			state.players.delete(socket.id);
		}

		room.players.delete(socket.id);
		socket.leave(getRoomKey(roomId));
		currentRoomId = null;

		if (room.solo) {
			rooms.delete(roomId);
			roomStates.delete(roomId);
		}

		
		broadcastRooms();
		if (!room.solo) broadcastGame(roomId, state);
	}

	socket.on('player-leave', () => {
		console.log(`player-leave received, currentRoomId: ${currentRoomId}`);
		if (currentRoomId !== null) removeFromRoom(currentRoomId);
	});

	socket.on('disconnect', () => {
		if (currentRoomId !== null) removeFromRoom(currentRoomId);
	});
});

setInterval(() => {
	roomStates.forEach((state, roomId) => {
		if (state.players.size === 0) return;

		const activeMobs = state.getAllActiveMobs();
		const activeBefore = state.bulletPool.getActive().length;
		state.bulletPool.updateAll();
		let changed = activeBefore !== state.bulletPool.getActive().length;

		state.bulletPool.getActive().forEach(bullet => {
			state.players.forEach(player => {
				if (player.identifier === bullet.ownerId) return;
				if (player.collidesWith(bullet)) {
					player.takeDamage(1);
					bullet.active = false;
					changed = true;
					if (player.isDead()) console.log(`${player.username} eliminated.`);
				}
			});

			activeMobs.forEach(mob => {
				if (mob.collidesWith(bullet)) {
					mob.takeDamage(1);
					bullet.active = false;
					changed = true;
					if (mob.isDead()) mob.active = false;
				}
			});
		});

		activeMobs.forEach(mob => {
			if (mob instanceof Pie) { //Pareil c'est hardcodé, Pas très SOLID
				const target = getClosestPlayer(mob, state.players);
				mob.target = target ? { x: target.x, y: target.y } : null;
			}

			mob.move();

			state.players.forEach(player => {
				if (player.collidesWith(mob)) {
					player.takeDamage(mob.damage);
					changed = true;
					if (player.isDead()) console.log(`${player.username} eliminated.`);
				}
			});

			if (mob.x < -mob.width) mob.active = false;
		});

		if (changed || activeMobs.length > 0) {
			broadcastGame(roomId, state);
			broadcastMobs(roomId, state);
		}
	});
}, 1000 / 60);

setInterval(() => {
	roomStates.forEach((state) => {
		if (state.players.size === 0) return;
		state.spawnMob();
	});
}, 2000);