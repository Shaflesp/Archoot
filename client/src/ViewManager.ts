import type { View } from './screens/View';

export class ViewManager {
	screens: Map<string, View> = new Map();
	current?: View;

	add(name: string, sc: View) {
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
