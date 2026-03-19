export interface View {
	show(): void;
	hide(): void;
}

export abstract class CanvasView {
	private _element: HTMLElement;
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;

	constructor(elementId: string) {
		this._element = document.getElementById(elementId)!;
		this._canvas = this._element.querySelector<HTMLCanvasElement>('.gameCanvas')!;
		this._ctx = this._canvas.getContext('2d')!;
	}

	get element(): HTMLElement {
		return this._element;
	}

	set element(value: HTMLElement) {
		this._element = value;
	}

	get canvas(): HTMLCanvasElement {
		return this._canvas;
	}

	set canvas(value: HTMLCanvasElement) {
		this._canvas = value;
	}

	get ctx(): CanvasRenderingContext2D {
		return this._ctx;
	}

	set ctx(value: CanvasRenderingContext2D) {
		this._ctx = value;
	}
}