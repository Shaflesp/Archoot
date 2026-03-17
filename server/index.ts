import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './Player.ts'

const httpServer = http.createServer((_req, res) => {
	res.statusCode = 200;
});

const players = new Map<string, Player>();

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

		players.set(socket.id, new Player(socket.id, username));
		console.log(`Player registered: ${username} (${socket.id})`);
		socket.emit('register_success');
	});

	socket.on('keypress', direction => {
		console.log(`Keypress received: ${direction}`);

		const player = players.get(socket.id);
		console.log(`Player found: ${!!player}`);

		if (!player) {
			console.log(`No player for socket: ${socket.id}`);
			socket.emit('game_error', 'You must register before playing.');
			return;
		}

		player.move(direction);
		console.log(`${player.username} moved ${direction} → (${player.x}, ${player.y})`);
	});

	socket.on('player-leave', () => {
		const player = players.get(socket.id);
		if (player) {
			console.log(`${player.username} disconnected.`);
			players.delete(socket.id);
		}
	});

	socket.on('disconnect', () => {
		const player = players.get(socket.id);
		if (player) {
			console.log(`${player.username} disconnected.`);
			players.delete(socket.id);
		}
	});
});

setInterval(() => {
	const playerInfo: any = {};

	players.forEach(p => {
		playerInfo[p.identifier] = p.getAsJson();
	});

	io.emit('playerInfo', playerInfo);
}, 1000 / 120);
