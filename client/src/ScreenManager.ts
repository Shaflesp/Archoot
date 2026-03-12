import type { Screen } from './screens/Screen';

export class ScreenManager {
	screens: Map<string, Screen> = new Map();
	current?: Screen;

	add(name: string, sc: Screen) {
		this.screens.set(name, sc);
	}

	show(name: string) {
		if (this.current) {
			this.current.hide();
		}

		const nv = this.screens.get(name);

		if (nv) {
			this.current = nv;
			this.current.show();
		}
	}
}
