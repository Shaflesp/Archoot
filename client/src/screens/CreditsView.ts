import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';

export class CreditsView implements View {
    element = document.getElementById('credits-screen')!;

    constructor(sm: ViewManager) {
        this.element.querySelector<HTMLAnchorElement>('.back-button')?.addEventListener('click', () => {
            console.log('Bouton retour cliqué (via Credits)');
            sm.show('home-screen');
        });
    }

    show(): void {
        console.log('CreditsScreen appelé');
        this.element.style.display = 'flex';
    }

    hide(): void {
        this.element.style.display = 'none';
    }
}