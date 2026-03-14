import { io } from 'socket.io-client';
import { ViewManager } from './ViewManager.ts';
import { HomeView } from './screens/HomeView.ts';
import { GameView } from './screens/GameView.ts';
import { LeaderboardView } from './screens/LeaderboardView.ts';
import { CreditsView } from "./screens/CreditsView.ts";

const sm = new ViewManager();

const socket = io(window.location.hostname + ':8080');

sm.add('home-screen', new HomeView(sm,socket));
sm.add('game-screen', new GameView(sm,socket));
sm.add('leaderboard-screen', new LeaderboardView(sm));
sm.add('credits-screen', new CreditsView(sm));

sm.show('home-screen');

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
