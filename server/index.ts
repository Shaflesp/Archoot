import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './Entity/Player.ts';

import type { RoomServer } from './RoomServer.ts';
import RoomState from './RoomState.ts';
import GameManager from './GameManager.ts';
import type { Entite } from '../client/src/entite/Entite.ts';
import type { PlayerData } from './Entity/PlayerData.ts';
import { Leaderboard } from './Leaderboard.ts';

const httpServer = http.createServer((_req, res) => {
	res.statusCode = 200;
});

const boundWidth: number = 1680;
const boundHeight: number = 800;

const rooms = new Map<number, RoomServer>();
const roomStates = new Map<number, RoomState>();
let roomIdCpt = 0;

const dirtyRooms: Set<number> = new Set();

const gameManagers = new Map<number, GameManager>();
const registeredUsernames: Set<string> = new Set();

const leaderboard = new Leaderboard();

function createRoom(
	name: string,
	capacityMax: number,
	solo: boolean = false
): RoomServer {
	const state = new RoomState(boundWidth, boundHeight);
	const manager = new GameManager(state);

	const r: RoomServer = {
		id: ++roomIdCpt,
		name,
		capacityMax,
		players: new Set(),
		solo,
	};
	rooms.set(r.id, r);
	roomStates.set(r.id, state);
	gameManagers.set(r.id, manager);
	return r;
}

createRoom('Coconut [DO NOT DELETE]', 4);

const port = 8080;
httpServer.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}.`);
});

const io = new IOServer(httpServer, { cors: { origin: true } });

function broadcastRooms(
	target: { emit: (event: string, data: object) => void } = io,
	bannedRooms: Set<number> = new Set()
) {
	const roomList = Array.from(rooms.values())
		.filter(r => !r.solo && !bannedRooms.has(r.id))
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
	const t0 = performance.now();
	const playerInfo: Map<string, object> = new Map();
	state.players.forEach(p => playerInfo.set(p.identifier, p.getAsJson()));
	const t1 = performance.now();
	let t2 = performance.now();
	let t3 = performance.now();

	io.to(getRoomKey(roomId)).emit('playerInfo', {
		players: Object.fromEntries(playerInfo),
		t2: performance.now(),
		bullets: state.bulletPool.getActive().map(b => b.getAsJson()),
		t3: performance.now(),
	});

	const total = t3 - t0;
	// if (total > 1){
	// 	console.log(`[BroadCastGame SLOW TICK ${total.toFixed(2)}ms`);
	// 	console.log(`  playersForEach:    ${(t1 - t0).toFixed(2)}ms`);
	// 	console.log(`  playersEntries:    ${(t2 - t1).toFixed(2)}ms`);
	// 	console.log(`  Bullet:            ${(t3 - t2).toFixed(2)}ms`);
	// }
}

function broadcastMobs(roomId: number, mobs: Array<Entite>) {
	const t0 = performance.now();

	const mobsInfo: object[] = [];
	mobs.forEach(m => mobsInfo.push(m.getAsJson()));
	const t1 = performance.now();
	io.to(getRoomKey(roomId)).emit('mobsInfo', { mobs: mobsInfo });
	const t2 = performance.now();

	const total = t2 - t0;
	// if (total > 1){
	// 	console.log(`[BroadCastMobs SLOW TICK ${total.toFixed(2)}ms`);
	// 	console.log(`  mobsForEach:    ${(t1 - t0).toFixed(2)}ms`);
	// 	console.log(`  MobEmit    ${(t2 - t1).toFixed(2)}ms`);
	// }
}

io.on('connection', socket => {
	broadcastRooms();

	let currentRoomId: number | null = null;
	const bannedRooms: Set<number> = new Set();

	socket.on('get-rooms', () => {
		broadcastRooms(socket);
	});

	socket.on('register', (data: { username: string }) => {
		const username = data.username?.trim();

		if (!username || username.length < 2) {
			socket.emit('register_error', 'Invalid username.');
			return;
		}

		const isMine = socket.data.username === username;

		if (!isMine && registeredUsernames.has(username)) {
			socket.emit('register_error', 'Username already taken.');
			return;
		}

		if (socket.data.username && socket.data.username !== username) {
			registeredUsernames.delete(socket.data.username);
		}

		registeredUsernames.add(username);
		socket.data.username = username;
		socket.emit('register_success');
	});

	socket.on('join-room', (roomId: number) => {
		const room = rooms.get(roomId);
		const state = roomStates.get(roomId);

		if (bannedRooms.has(roomId)) {
			socket.emit('room_error', 'You cannot rejoin a room you have left.');
			return;
		}

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

	socket.on('create-room', (capacity: number, name: string = '') => {
		const username = socket.data.username as string | undefined;
		if (!username) {
			socket.emit('room_error', 'You must register first.');
			return;
		}

		if (currentRoomId !== null) removeFromRoom(currentRoomId);

		const roomName = capacity == 1 ? `${username}'s game` : name;
		const solo = capacity == 1;

		const room = createRoom(roomName, capacity, solo);
		const state = roomStates.get(room.id)!;

		currentRoomId = room.id;
		room.players.add(socket.id);
		socket.join(getRoomKey(room.id));
		state.players.set(
			socket.id,
			new Player(socket.id, username, boundWidth, boundHeight)
		);

		console.log(`${username} created solo room ${room.id}`);
		socket.emit('join-room-success', room.id);

		broadcastGame(room.id, state);
	});

	socket.on('add-score', (p: PlayerData) => {
		//leaderboard.addPlayer(p.username, p.score);
		console.log(`Score ajouté`);
	});

	socket.on('move', (data: { dx: number; dy: number }) => {
		if (currentRoomId === null) return;
		const state = roomStates.get(currentRoomId);
		if (!state) return;

		const player = state.players.get(socket.id);
		if (!player || player.isDead()) return;

		player.move(data.dx, data.dy);
		dirtyRooms.add(currentRoomId);
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
			gameManagers.delete(roomId);
		} else {
			bannedRooms.add(roomId);
		}

		if (room.players.size == 0) {
			rooms.delete(roomId);
			roomStates.delete(roomId);
			gameManagers.delete(roomId);
		}

		broadcastRooms();
		if (!room.solo) broadcastGame(roomId, state);
	}

	socket.on('player-leave', () => {
		if (currentRoomId !== null) removeFromRoom(currentRoomId);
	});

	socket.on('disconnect', () => {
		if (socket.data.username) {
			registeredUsernames.delete(socket.data.username);
		}
		if (currentRoomId !== null) removeFromRoom(currentRoomId);
	});
});

setInterval(() => {
	roomStates.forEach((state, roomId) => {
		if (state.players.size === 0) return;

		const t0 = performance.now();

		const manager = gameManagers.get(roomId);
		const activeMobs = state.getAllActiveMobs();

		state.bulletPool.updateAll();
		const activeBullets = state.bulletPool.getActive();

		let playersChanged = dirtyRooms.has(roomId);
		let mobsChanged = false;

		dirtyRooms.delete(roomId);

		const t1 = performance.now();

		let totalPlayerBullet: DOMHighResTimeStamp = performance.now();
		let totalMobBulllet: DOMHighResTimeStamp = performance.now();
		let totalBullet: number = performance.now();

		activeBullets.forEach(bullet => {
			state.players.forEach(player => {
				if (!player.active) return;
				if (player.identifier === bullet.ownerId) return;
				if (player.collidesWith(bullet)) {
					player.takeDamage(1);
					bullet.active = false;
					playersChanged = true;
					if (player.isDead()) console.log(`${player.username} eliminated.`);
				}
				totalPlayerBullet += performance.now();
			});

			if (!bullet.active) return;

			activeMobs.forEach(mob => {
				if (!mob.active) return;
				if (!bullet.active) return;
				if (mob.collidesWith(bullet)) {
					mob.takeDamage(1);
					bullet.active = false;
					mobsChanged = true;
					if (mob.isDead()) {
						mob.active = false;

						const killer = state.players.get(bullet.ownerId);
						if (killer) killer.score += 100;
						if (manager?.isBoss(mob.name)) manager.bossDead();
					}
				}
				totalMobBulllet += performance.now();
			});
		});
		totalBullet = totalPlayerBullet + totalMobBulllet - t1;

		console.log('\n');
		console.log(`  BulletTotal:       ${totalBullet.toFixed(2)}ms`);
		console.log(
			`  PlayerTotal:       ${(totalPlayerBullet - t1).toFixed(2)}ms`
		);
		console.log(
			`  MobTotal:       ${(totalMobBulllet - totalPlayerBullet).toFixed(2)}ms`
		);

		const t2 = performance.now();

		activeMobs.forEach(mob => {
			if (mob.needsTarget()) {
				const target = manager?.getClosestPlayer(mob);
				mob.target = target ? { x: target.x, y: target.y } : null;
			}

			mob.move();
			mobsChanged = true;

			state.players.forEach(player => {
				if (!player.active) return;
				if (player.collidesWith(mob)) {
					player.takeDamage(mob.damage);
					playersChanged = true;

					if (!manager?.isBoss(mob.name)) {
						mob.active = false;
						mobsChanged = true;
					} else {
						const knockbackDist = 150;
						const angle = Math.atan2(player.y - mob.y, player.x - mob.x);

						player.x = Math.max(
							0,
							Math.min(
								boundWidth - player.width,
								player.x + Math.cos(angle) * knockbackDist
							)
						);
						player.y = Math.max(
							0,
							Math.min(
								boundHeight - player.height,
								player.y + Math.sin(angle) * knockbackDist
							)
						);
					}
					if (player.isDead()) console.log(`${player.username} eliminated.`);
				}
			});

			if (mob.x < -mob.width) mob.active = false;
			mobsChanged = true;
		});

		const t3 = performance.now();

		if (playersChanged) broadcastGame(roomId, state);
		const t4 = performance.now();
		if (mobsChanged) broadcastMobs(roomId, activeMobs);
		const t5 = performance.now();

		const total = t5 - t0;
		// if (total > 5) {
		// 	console.log("\n\n");
		// 	console.log(`[Room ${roomId}] SLOW TICK ${total.toFixed(2)}ms`);
		// 	console.log(`  setup:      ${(t1 - t0).toFixed(2)}ms`);
		// 	console.log(`  bullets:    ${(t2 - t1).toFixed(2)}ms`);
		// 	console.log(`  mobs:       ${(t3 - t2).toFixed(2)}ms`);
		// 	console.log(`  broadcastGame:  ${(t4 - t3).toFixed(2)}ms`);
		// 	console.log(`  broadcastMob:  ${(t5 - t4).toFixed(2)}ms`);
		// }
	});
}, 1000 / 60);

setInterval(() => {
	gameManagers.forEach(manager => {
		manager.spawnMob();
	});
}, 2000);
