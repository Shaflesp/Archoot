import { io } from 'socket.io-client';
import { ViewManager } from './ViewManager.ts';
import { HomeView } from './screens/HomeView.ts';
import { GameView } from './screens/GameView.ts';
import { LeaderboardView } from './screens/LeaderboardView.ts';
import { CreditsView } from './screens/CreditsView.ts';
import { RoomsView } from './screens/RoomsView.ts';
import { CreateRoomView } from './screens/CreateRoomView.ts';

const sm = new ViewManager();

const socket = io(window.location.hostname + ':8080');

sm.add('home-screen', new HomeView(sm, socket));
sm.add('game-screen', new GameView(sm, socket));
sm.add('leaderboard-screen', new LeaderboardView(sm));
sm.add('credits-screen', new CreditsView(sm));
sm.add('search-room', new RoomsView(sm, socket));
sm.add('create-room-screen', new CreateRoomView(sm, socket));

sm.show('home-screen');
