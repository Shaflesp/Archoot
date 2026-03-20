import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './Entity/Player.ts'
import { BulletPool } from './Entity/Bullet.ts';
import Spider from '../client/src/entite/spider.ts';
import Pie from '../client/src/entite/pie.ts';
import Galinette from '../client/src/entite/galinette.ts';
import type { Entite } from '../client/src/entite/Entite.ts';

const httpServer = http.createServer((_req, res) => {
	res.statusCode = 200;
});

const boundWidth: number = 1680;
const boundHeight: number = 800;

const players = new Map<string, Player>();
const bulletPool = new BulletPool(100, boundWidth, boundHeight);

const mobsTypes = ['spider', 'pie', 'galinette'];
const mobsList:Entite[] = [];

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

		if (!player) {
			socket.emit('game_error', 'You must register before playing.');
			return;
		}

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
		if (!player) return;

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

function broadcast() {
    const playerInfo: Map<string, object> = new Map();
    players.forEach(p => playerInfo.set(p.identifier, p.getAsJson()));
    io.emit('playerInfo', {
			players: Object.fromEntries(playerInfo),
			bullets: bulletPool.getActive().map(b => b.getAsJson()),
		});
}

setInterval(() => {
	const activeBefore = bulletPool.getActive().length;

	bulletPool.updateAll();

	let changed = activeBefore !== bulletPool.getActive().length;

	bulletPool.getActive().forEach(bullet => {
		players.forEach(player => {
			if (player.identifier === bullet.ownerId) return;
			if (player.collidesWith(bullet)) {
				bullet.active = false;
				changed = true;
			}
		});
	});

	if (changed) {
		broadcast();
	}
}, 1000 / 60);

function spawnMobs(){
	const randomMobs = Math.floor(Math.random()*mobsTypes.length);

	switch(mobsTypes[randomMobs]){
		case 'spider':
			mobsList.push(new Spider()); 
		case 'pie':
			mobsList.push(new Pie());
		case 'galinette':
			mobsList.push(new Galinette());
		default:
			mobsList.push(new Spider());
	} 
}
setInterval(spawnMobs, 2000); 

function broadcastMob(){
	const mobsInfo: object[] = [];
	mobsList.forEach(m => mobsInfo.push(m.getAsJson()));
	io.emit('mobsInfo', {
		mobs: mobsInfo
	});
}