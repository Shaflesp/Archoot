import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import type { Socket } from 'socket.io-client';

export class CreateRoomView implements View {
	socket: Socket;
	sm: ViewManager;

	element = document.getElementById('create-room-screen')!;

	roomName = document.querySelector<HTMLInputElement>(
		`.create-room-form input[name="name"]`
	)!;
	playerCount = document.querySelector<HTMLInputElement>(
		`.create-room-form input[name="player-count"]`
	)!;
	submitButton = document.querySelector<HTMLInputElement>(
		`.create-room-form input[name="submit-room"]`
	)!;

	inputValues = document.querySelectorAll<HTMLInputElement>('.create-input')!;

	nameWarning = document.querySelector(`.name-warning`)!;
	playerCountWarning = document.querySelector(`.player-count-warning`)!;
	submitWarning = document.querySelector(`.submit-warning`)!;

	capacityMax = 2;
	name = '';

	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;

		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				console.log('Bouton retour cliqué (via Rooms)');

				sm.show('home-screen');
			});

		this.inputValues.forEach(elem => {
			elem.addEventListener('input', () => {
				this.handleForm();
			});
		});

		this.submitButton.addEventListener('click', event => {
			event.preventDefault();

			if (this.handleForm()) {
				this.submit();
			}
		});
	}

	show(): void {
		const body = document.body;
		body.style.backgroundImage = "url('/images/fondAccueil.gif')";
		body.style.backgroundColor = "transparent";
		body.style.backgroundBlendMode = "normal";

		this.element.style.display = 'flex';
		this.socket.on('join-room-success', this.onJoinRoomSuccess);
		this.handleForm();
	}

	hide(): void {
		this.element.style.display = 'none';
		this.socket.off('join-room-success', this.onJoinRoomSuccess);
	}

	handleNameField(): boolean {
		const currentName = this.roomName?.value!;

		if (currentName === '') {
			this.nameWarning.innerHTML = 'Le nom ne doit pas être vide.';
			return false;
		}

		this.name = currentName;
		this.nameWarning.innerHTML = '';
		return true;
	}

	handleCountField(): boolean {
		const currentCount = this.playerCount?.value!;
		const countNum = Number(currentCount);

		if (currentCount === '') {
			this.playerCountWarning.innerHTML =
				'Il doit y avoir des joueurs dans la partie.';
			return false;
		}

		if (countNum < 2 || countNum > 8) {
			this.playerCountWarning.innerHTML =
				'Le nombre de joueurs doit être entre 2 et 8.';
			return false;
		}

		this.capacityMax = countNum;
		this.playerCountWarning.innerHTML = '';

		return true;
	}

	handleForm(): boolean {
		const nameValid = this.handleNameField();
		const countValid = this.handleCountField();

		if (!nameValid || !countValid) {
			this.submitButton.disabled = true;
			this.submitWarning.innerHTML = `L'un des champs est incorrect.`;
			return false;
		}

		this.submitButton.disabled = false;
		this.submitWarning.innerHTML = '';
		return true;
	}

	submit(): void {
		this.socket.emit('create-room', this.capacityMax, this.name);
	}
	private onJoinRoomSuccess = (_data: {roomId: number, solo: boolean}) => {
			this.sm.show('game-screen');
	}
}
