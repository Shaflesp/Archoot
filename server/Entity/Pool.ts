export class Pool<T extends { id:number, active: boolean; reset(): void; update?(): void }> {

	private pool: Array<T>;
	private nextId: number = 0;

	constructor(factory: () => T, size: number) {
		this.pool = [];
		for (let i = 0; i < size; i++) {
			this.pool.push(factory());
		}
	}

	acquire(): T | null {
		const item = this.pool.find(i => !i.active);
		if (!item) return null;
		item.reset();
		item.id = ++this.nextId;
		return item;
	}

	updateAll(): void {
		this.pool.filter(i => i.active).forEach(i => i.update?.());
	}

	getActive(): Array<T> {
		return this.pool.filter(i => i.active);
	}
}
