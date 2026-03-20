import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import type { Socket } from 'socket.io-client';
import { Popup } from './Popup.ts';

export class RoomsView implements View {
	socket: Socket;
	sm: ViewManager;

	element = document.getElementById('room-select-screen')!;
	pseudoInput = document.getElementById('pseudo') as HTMLInputElement;
	usernamePopup = new Popup('.username');

	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;
	}

	show(): void {
		this.element.style.display = 'flex';
		this.socket.on('register_success', this.onRegisterSuccess);
		this.socket.on('register_error', this.onRegisterError);
	}

	hide(): void {
		this.element.style.display = 'none';
		this.socket.off('register_success', this.onRegisterSuccess);
		this.socket.off('register_error', this.onRegisterError);
	}

	private onRegisterSuccess = () => {
		this.sm.show('game-screen');
	};

	private onRegisterError = (message: string) => {
		console.error('Registration failed:', message);
	};
}
