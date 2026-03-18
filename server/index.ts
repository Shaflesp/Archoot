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
    io.emit('playerInfo', Object.fromEntries(playerInfo));
}
