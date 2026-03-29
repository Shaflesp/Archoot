import fs from 'fs';

interface ScoreEntry {
	username: string;
	score: number;
	date: string;
}

export class Leaderboard {
	private scores: ScoreEntry[] = [];
	private readonly MAX: number = 10;
	private FILE_PATH: string = 'server/leaderboard.json';

	public load(): void {
		try {
			if (fs.existsSync(this.FILE_PATH)) {
				const data = fs.readFileSync(this.FILE_PATH, 'utf-8');
				this.scores = JSON.parse(data);
			}
		} catch (error) {
			console.log('No existing leaderboard found, starting fresh.');
		}
	}

	public addPlayer(player: string, score: number): void {
		const date = new Date().toLocaleDateString('fr-FR');

		this.scores.push({
			username: player,
			score: score,
			date: date,
		});

		this.scores.sort((a, b) => b.score - a.score);
		// mdn : (a, b) => a - b ça trie par ordre croissant

		if (this.scores.length > this.MAX) {
			this.scores = this.scores.slice(0, this.MAX);
		}
		this.save();
	}

	public save(): void {
		const leaderdata = JSON.stringify(this.scores, null, 2);

		fs.writeFile(this.FILE_PATH, leaderdata, err => {
			if (err) {
				console.log('Error writing file:', err);
			} else {
				console.log('Successfully wrote leaderboard file');
			}
		});
		console.log(leaderdata);
	}

	public getLeaderboard(): ScoreEntry[] {
		return this.scores;
	}
}
