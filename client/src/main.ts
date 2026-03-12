import { ScreenManager } from './ScreenManager.ts';
import { HomeScreen } from './screens/HomeScreen.ts';
import { GameScreen } from './screens/GameScreen.ts';
import { LeaderboardScreen } from './screens/LeaderboardScreen.ts';

const sm = new ScreenManager();

sm.add('home-screen', new HomeScreen(sm));
sm.add('game-screen', new GameScreen(sm));
sm.add('leaderboard-screen', new LeaderboardScreen(sm));

sm.show('home-screen');
