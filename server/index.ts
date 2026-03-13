import http from 'http';
import { Server as IOServer } from 'socket.io';

const httpServer = http.createServer((_req, res) => {
	res.statusCode = 200;
});

const port = 8080;
httpServer.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}.`);
});

const io = new IOServer(httpServer, { cors: { origin: true } });

io.on('connection', socket => {
	socket.on('keypress', event => console.log(event));
});
