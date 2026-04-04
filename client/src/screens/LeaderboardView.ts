import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';

interface ScoreEntry {
	username: string;
	score: number;
	date: string;
}

export class LeaderboardView implements View {
	element = document.getElementById('leaderboard-screen')!;

	constructor(sm: ViewManager) {
		this.element
			.querySelector('.back-button')
			?.addEventListener('click', () => {
				sm.show('home-screen');
			});
	}

	private render(scores: ScoreEntry[]): void {
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
			if (nameEl) nameEl.textContent = '---';
			if (scoreEl) scoreEl.textContent = '';
			if (dateEl) dateEl.textContent = '';
		}
	}

	async show(): Promise<void> {
		const body = document.body;
		body.style.backgroundImage = `url('${import.meta.env.BASE_URL}images/fondAccueil.gif')`;
		body.style.backgroundColor = "transparent";
		body.style.backgroundBlendMode = "normal";

		this.element.style.display = 'flex';
		try {
			const response = await fetch(
				'https://archoot.onrender.com/api/leaderboard'
			);
			if (response.ok) {
				const scores = await response.json();
				this.render(scores);
			} else {
				this.render([]); // Render empty if file doesn't exist yet
			}
		} catch (err) {
			console.error('Failed to fetch leaderboard:', err);
			this.render([]);
		}
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
