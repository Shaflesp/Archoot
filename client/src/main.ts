import { io } from 'socket.io-client';
import { ViewManager } from './ViewManager.ts';
import { HomeView } from './screens/HomeView.ts';
import { GameView } from './screens/GameView.ts';
import { LeaderboardView } from './screens/LeaderboardView.ts';
import { CreditsView } from './screens/CreditsView.ts';
import { RoomsView } from './screens/RoomsView.ts';
import { CreateRoomView } from './screens/CreateRoomView.ts';

const sm = new ViewManager();

//const socket = io(window.location.hostname + ':8080');
const socket = io('https://archoot.onrender.com');

const splash = document.getElementById('splash-screen')!;
const splashText = document.querySelector<HTMLElement>('.splash-text')!;

sm.add('home-screen', new HomeView(sm, socket));
sm.add('game-screen', new GameView(sm, socket));
sm.add('leaderboard-screen', new LeaderboardView(sm));
sm.add('credits-screen', new CreditsView(sm));
sm.add('search-room', new RoomsView(sm, socket));
sm.add('create-room-screen', new CreateRoomView(sm, socket));

splashText.textContent = 'Fait avec amour par...';

setTimeout(() => {
	splashText.classList.add('hidden');
}, 1000);

setTimeout(() => {
	splashText.textContent = "L'Equipe 5";
	splashText.classList.remove('hidden');
}, 1500);

setTimeout(() => {
	splash.classList.add('fade-out');
}, 3000);

setTimeout(() => {
	splash.remove();
	sm.show('home-screen');
}, 5000);
