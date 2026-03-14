import http from 'http';
import { Server as IOServer } from 'socket.io';
import { Player } from './Player.ts';

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
	players.set(socket.id, new Player(socket.id));

	socket.on('keypress', event => {
		console.log(`${event} de ${socket.id}`);

		const player = players.get(socket.id);

		if (player) {
			player.move(event);
		}
	});

	socket.on('disconnect', () => {
		players.delete(socket.id);
	});
});

setInterval(() => {
	const playerInfo: any = {};

	players.forEach(p => {
		playerInfo[p.identifier] = p.getAsJson();
	});

	io.emit('playerInfo', playerInfo);
}, 1000 / 120);
