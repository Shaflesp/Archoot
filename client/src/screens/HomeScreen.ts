import type { Screen } from './Screen.ts';

export class HomeScreen implements Screen {
	element = document.getElementById('home-screen')!;

	show(): void {
		this.element.style.display = 'block';
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
