const home = document.getElementById('home-screen')!;
const game = document.getElementById('game-screen')!;
const leaderboard = document.getElementById('leaderboard-screen')!;

function showHome() {
	home.style.display = 'block';
	game.style.display = 'none';
	leaderboard.style.display = 'none';
}

function showGame() {
	home.style.display = 'none';
	game.style.display = 'block';
	leaderboard.style.display = 'none';
}

function showLeaderboard() {
	home.style.display = 'none';
	game.style.display = 'none';
	leaderboard.style.display = 'block';
}
