import { ViewManager } from './ViewManager.ts';
import { HomeView } from './screens/HomeView.ts';
import { GameView } from './screens/GameView.ts';
import { LeaderboardView } from './screens/LeaderboardView.ts';

const sm = new ViewManager();

sm.add('home-screen', new HomeView(sm));
sm.add('game-screen', new GameView(sm));
sm.add('leaderboard-screen', new LeaderboardView(sm));

sm.show('home-screen');
