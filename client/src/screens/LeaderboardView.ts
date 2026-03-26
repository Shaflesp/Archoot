import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import { Leaderboard } from '../../../server/Leaderboard.ts';

export class LeaderboardView implements View {
    element = document.getElementById('leaderboard-screen')!;
    private leaderboard = new Leaderboard();

    constructor(sm: ViewManager) {
        this.element.querySelector('.back-button')?.addEventListener('click', () => {
            sm.show('home-screen');
        });
    }

    private render(): void {
        const scores = this.leaderboard.getLeaderboard();

        this.fillPodium(scores[0], '.place.first');
        this.fillPodium(scores[1], '.place.second');
        this.fillPodium(scores[2], '.place.third');

        const last = this.element.querySelector('.last');
        if (last) {
            last.innerHTML = '';
            const others = scores.slice(3);

            others.forEach((entry, i) => {
                const p = document.createElement('p');
                p.innerHTML = `<span>${i + 4}</span> <strong>${entry.username}</strong> - ${entry.score} pts - ${entry.date}`;
                last.appendChild(p);
            });
        }
    }

    private fillPodium(entry: any, selector: string): void {
        const container = this.element.querySelector(selector);
        if (!container) return;

        const nameEl = container.querySelector('.player-name');
        const scoreEl = container.querySelector('.player-score');
        const dateEl = container.querySelector('.player-date');

        if (entry) {
            if (nameEl) nameEl.textContent = entry.username;
            if (scoreEl) scoreEl.textContent = `${entry.score} pts`;
            if (dateEl) dateEl.textContent = entry.date;
        } else {
            if (nameEl) nameEl.textContent = "---";
            if (scoreEl) scoreEl.textContent = "";
            if (dateEl) dateEl.textContent = "";
        }
    }

    async show(): Promise<void> {
        this.element.style.display = 'flex';
        await this.leaderboard.load();
        this.render();
    }

    hide(): void {
        this.element.style.display = 'none';
    }
}
