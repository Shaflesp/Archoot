export class Popup {
	closeButton: HTMLElement;
	popup: HTMLElement;

	constructor(selector: string) {
		this.closeButton = document.querySelector(`${selector}.closeButton`)!;
		this.popup = document.querySelector<HTMLElement>(`${selector}.popup`)!;

		this.closeButton.addEventListener('click', event => {
			event.preventDefault();
			console.log('Registered close');
			this.close();
		});
	}

	show() {
		this.popup.style.display = 'flex';
		this.popup.classList.add('visible');
	}

	close() {
		this.popup.style.display = 'none';
		this.popup.classList.remove('visible');
	}
}
