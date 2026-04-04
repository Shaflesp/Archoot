import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from '../shared/Entity/Player.ts';

import type { RoomServer } from './RoomServer.ts';
import RoomState from './RoomState.ts';
import GameManager from './GameManager.ts';
import type { Entite } from '../shared/Mob/Entite.ts';
import RucheHour from '../shared/Mob/RucheHour.ts';
import type { PlayerData } from '../shared/Entity/PlayerData.ts';
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
leaderboard.load();

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
	console.log(`Server is running on port ${port}.`);
});

//const io = new IOServer(httpServer, { cors: { origin: true } });
const io = new IOServer(httpServer, {
	cors: {
		//origin: '*',
		origin: 'https://nihileaf.dev',
	},
});

function createRoom(
	name: string,
	capacityMax: number,
	solo: boolean = false,
	pvp: boolean = false,
	creatorId: string
): RoomServer {
	const r: RoomServer = {
		id: ++roomIdCpt,
		name,
		capacityMax,
		players: new Set(),
		solo,
		pvp,
		status: solo ? 'playing' : 'waiting',
		creatorId
	};

	const state = new RoomState(boundWidth, boundHeight);
	const manager = new GameManager(state, io, getRoomKey(r.id));
	rooms.set(r.id, r);
	roomStates.set(r.id, state);
	gameManagers.set(r.id, manager);
	return r;
}

function broadcastRooms(
	target: { emit: (event: string, data: object) => void } = io,
	bannedRooms: Set<number> = new Set()
) {
	const roomList = Array.from(rooms.values())
		.filter(r => !r.solo && r.status === 'waiting' && !bannedRooms.has(r.id))
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

function broadcastMobs(roomId: number, mobs: Array<Entite>) {
	const mobsInfo: object[] = [];
	mobs.filter(m => m.active).forEach(m => mobsInfo.push(m.getAsJson()));
	io.to(getRoomKey(roomId)).emit('mobsInfo', { mobs: mobsInfo });}

function broadcastBonuses(roomId:number){
	const manager = gameManagers.get(roomId);
	if(!manager) return;

	const bonusData = manager.activeBonuses
		.filter(b => b.active)
		.map( b => (b.getAsJSON()));

	io.to(getRoomKey(roomId)).emit('bonusInfo', {bonuses : bonusData});
}

function startGame(roomId: number) {
	const room = rooms.get(roomId);
	if (!room || room.status === 'playing') return;

	let count = 3;

	io.to(getRoomKey(roomId)).emit('game-announcement', count.toString());

	const countdownInterval = setInterval(() => {
		count--;

		if (count > 0) {
			io.to(getRoomKey(roomId)).emit('game-announcement', count.toString());
		} else if (count === 0) {
			io.to(getRoomKey(roomId)).emit('game-announcement', 'Start !');

			if (rooms.has(roomId)) {
				room.status = 'playing';
				broadcastRooms();
			}
		} else {
			clearInterval(countdownInterval);
			io.to(getRoomKey(roomId)).emit('game-started');
		}
	}, 1000);
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

		if (room && room.status === 'playing') {
			socket.emit('room_error', 'Cette partie a déjà commencé.');
			return;
		}

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
		socket.emit('join-room-success', {
			roomId: room.id,
			solo: room.solo,
			isCreator: false,
		});
		broadcastGame(roomId, state);
	});

	socket.on('force-start-game', () => {
		if (currentRoomId === null) return;
		const room = rooms.get(currentRoomId);

		if (room && room.creatorId === socket.id && room.status === 'waiting') {
			if (room.autoStartTimeout) clearTimeout(room.autoStartTimeout);
			startGame(room.id);
		}
	});

	socket.on(
		'create-room',
		(capacity: number, name: string = '', pvp: boolean = false) => {

			const username = socket.data.username as string | undefined;
			if (!username) {
				socket.emit('room_error', 'You must register first.');
				return;
			}

			if (currentRoomId !== null) removeFromRoom(currentRoomId);

			const roomName = capacity == 1 ? `${username}'s game` : name;
			const solo = capacity == 1;

			const room = createRoom(roomName, capacity, solo, pvp, socket.id);
			if (!solo) {
				room.autoStartTimeout = setTimeout(() => {
					startGame(room.id);
				}, 90000);
			}

			const state = roomStates.get(room.id)!;

			currentRoomId = room.id;
			room.players.add(socket.id);
			socket.join(getRoomKey(room.id));
			state.players.set(
				socket.id,
				new Player(socket.id, username, boundWidth, boundHeight)
			);

			console.log(`${username} created solo room ${room.id}`);
			socket.emit('join-room-success', { roomId: room.id, solo: room.solo, isCreator: true });

			broadcastGame(room.id, state);
		}
	);

	socket.on('add-score', (p: PlayerData) => {
		leaderboard.addPlayer(p.username, p.score);
		console.log(`Score ajouté: ${p.username} ${p.score}`);
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

		/* Rafale de tir */
		const shotDx=data.dx;
		const shotDy=data.dy;

		for (let i = 0; i < player.arrowsPerClick; i++) {
			setTimeout(() => {
				if (!state.players.has(socket.id)) return;
				if (player.isDead()) return;

				const rucheBoss = state
					.getAllActiveMobs()
					.find(m => m.name === 'Ruche Hour') as RucheHour;
				const playersCanShoot = !(rucheBoss && rucheBoss.phase === 'green');
				if (!playersCanShoot) return;

				const bullet = state.bulletPool.acquire();
				if (!bullet) return;

				bullet.fire(
					player.x + player.width / 2,
					player.y + player.height / 2,
					shotDx,
					shotDy,
					player.identifier,
					player.damage,
					8
				);

				broadcastGame(currentRoomId!, state);
			}, i * 100);
		}
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

		const manager = gameManagers.get(roomId);
		const activeMobs = state.getAllActiveMobs();
		const activeBonus = manager?.getAllActiveBonuses();

		const activeBefore = state.bulletPool.getActive().length;
		state.bulletPool.updateAll();
		const activeBullets = state.bulletPool.getActive();

		let playersChanged = dirtyRooms.has(roomId);
		let mobsChanged = false;
		let bulletsChanged = activeBefore !== activeBullets.length;
		let bonusesChanged = false;

		dirtyRooms.delete(roomId);

		/* Bullets */
		activeBullets.forEach(bullet => {
			state.players.forEach(player => {
				if (!player.active) return;
				if (player.identifier === bullet.ownerId) return;

				const room = rooms.get(roomId);
				const isPlayerBullet = state.players.has(bullet.ownerId);

				if (isPlayerBullet && room && !room.pvp) return;

				if (player.collidesWith(bullet)) {
					player.takeDamage(1);
					bullet.active = false;
					playersChanged = true;
					bulletsChanged = true;
					if (player.isDead()) console.log(`${player.username} eliminated.`);
				}
			});

			if (!bullet.active) return;

			activeMobs.forEach(mob => {
				if (!mob.active) return;
				if (!bullet.active) return;
				if (bullet.ownerId === mob.name) return;

				if (mob.collidesWith(bullet)) {
					mob.takeDamage(bullet.damage);
					bullet.active = false;
					mobsChanged = true;
					bulletsChanged = true;

					if (mob.isDead()) {
						mob.active = false;
						mobsChanged = true;

						const killer = state.players.get(bullet.ownerId);
						const isBoss = manager?.isBoss(mob.name);
						if (killer) isBoss ? killer.score += 250 : killer.score += 100;
						if (isBoss) {
							manager?.bossDead();
							bonusesChanged=true;
							playersChanged=true;
						}
					}
				}
			});
		});
		if (activeBullets.length > 0) bulletsChanged = true;

		/* Mobs */
		activeMobs.forEach(mob => {
			if (mob.needsTarget()) {
				const target = manager?.getClosestPlayer(mob);
				mob.target = target ? { x: target.x, y: target.y } : null;
			}

			mob.move();
			mob.shoot(() => state.bulletPool.acquire());
			mob.hitPlayers(state.players);
			playersChanged = true;
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

			if (mob.x < -mob.width || mob.y < -mob.height || mob.y > boundHeight) {
				mob.active = false;
				mobsChanged = true;

				if (manager && manager.isBoss(mob.name)) {
					manager.bossDead();
				}
			}
		});

		/* Bonus */
		activeBonus?.forEach(b => {
			state.players.forEach(p => {
				if (!p.active || !b.active) return;

				if (
					p.x < b.x + b.width &&
					p.x + p.width > b.x &&
					p.y < b.y + b.height &&
					p.y + p.height > b.y
				) {
					b.giveBonus(p);
					b.active = false;
					playersChanged = true;
					bonusesChanged = true;
				}
			});
		});

		if (playersChanged || bulletsChanged) broadcastGame(roomId, state);
		if (mobsChanged) broadcastMobs(roomId, activeMobs);
		if (bonusesChanged) broadcastBonuses(roomId);
	});
}, 1000 / 60);

setInterval(() => {
	gameManagers.forEach((manager, roomId) => {
		const room = rooms.get(roomId);

		if (room) {
			manager.spawnMob(room.status);
		}
	});
}, 2000);
