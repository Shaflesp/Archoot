import { Player } from "./Entity/Player.ts";

interface ScoreEntry {
    username: string; 
    score: number;
    date: string;
}

export class Leaderboard {
    private scores: ScoreEntry[] = [];
    private readonly MAX:number = 10;
    private readonly FILE_PATH: string = "/statistique/leaderboard.json";

    public async load(): Promise<ScoreEntry[]> {
            const response = await fetch(this.FILE_PATH);
            if (response.ok) {
                this.scores = await response.json();
            }
        return this.scores;
    }

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

    public save(leaderboard: ScoreEntry[]): void {
        let lead = '';
        for(let i=1; i < leaderboard.length; i++){
            lead += JSON.stringify(leaderboard[i]);
        }
        console.log(lead);
    }

    public getLeaderboard(): ScoreEntry[]{
        return this.scores;
    }
}