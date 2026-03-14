import { Player } from "./Player";

interface ScoreEntry {
    username: string; 
    score: number;
    date: string;
}

export class Leaderboard {
    private scores: ScoreEntry[] = [];
    private readonly MAX:number = 10;

    public addPlayer(player : Player, score:number): void {
        const date = new Date().toLocaleDateString('fr-FR');
        
        this.scores.push({
            username: player.username,
            score: score,
            date: date
        });

        this.scores.sort((a, b) => b.score - a.score);
        // mdn : (a, b) => a - b ça trie par ordre croissant

        if(this.scores.length > this.MAX) {
            this.scores = this.scores.slice(0, this.MAX);
        }
    }

    public getLeaderboard(): ScoreEntry[]{
        return this.scores;
    }
}