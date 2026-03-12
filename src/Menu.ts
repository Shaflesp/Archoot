console.log('Menu chargé');

import  MenuView from './MenuView';
import CreditsView from  './CreditsView.js';
import LeaderView from './LeaderView.js';
import GameView from './GameView.js';
import Router from './Router.js';

const menuView = new MenuView();
const creditsView  = new CreditsView();
const leaderView = new LeaderView();
const gameView = new GameView();

const routes = [
	{ path: '/', view: menuView, title: 'Magasin' },
	{ path: '/credits', view: creditsView, title: 'À propos' },
	{ path: '/leaderboard', view: leaderView, title: 'Support' },
	{ path: '/game-*', view: gameView, title: 'Détail jeu' },
];
Router.routes = routes;
// élément dans lequel afficher le <h1> de la vue
Router.titleElement = document.querySelector('.viewGaeme');
// gestion des liens du menu (détection du clic et activation/désactivation)
Router.setMenuElement(document.querySelector('.mainMenu')!);

// chargement de la vue initiale selon l'URL demandée par l'utilisateur.rice (Deep linking)
Router.navigate(window.location.pathname, true);
// gestion des boutons précédent/suivant du navigateur (History API)
window.onpopstate = () => Router.navigate(document.location.pathname, true);
