import fs from 'fs';
//import path from 'path';

interface ScoreEntry {
	username: string;
	score: number;
	date: string;
}

export class Leaderboard {
	private scores: ScoreEntry[] = [];
	private readonly MAX: number = 10;
	private FILE_PATH: string = '/statistique/leaderboard.json';

	public async load(): Promise<ScoreEntry[]> {
		const response = await fetch(this.FILE_PATH);
		if (response.ok) {
			this.scores = await response.json();
		}
		return this.scores;
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

		fs.writeFile('leaderboard.json', leaderdata, err => {
			if (err) {
				console.log('Error writing file:', err);
			} else {
				console.log('Successfully wrote file');
			}
		});
		console.log(leaderdata);
	}

	public getLeaderboard(): ScoreEntry[] {
		return this.scores;
	}
}
