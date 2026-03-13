import { io } from 'socket.io-client';

const socket = io(window.location.hostname + ':8080');

window.addEventListener('keydown', e => {
	switch (e.key) {
		case 'ArrowUp':
			socket.emit('keypress', 'up');
			break;
		case 'ArrowDown':
			socket.emit('keypress', 'down');
			break;
		case 'ArrowLeft':
			socket.emit('keypress', 'left');
			break;
		case 'ArrowRight':
			socket.emit('keypress', 'right');
			break;
	}
});
