import type { ViewManager } from '../ViewManager.ts';
import type { View } from './View.ts';
import type { Socket } from 'socket.io-client';
import { Popup } from './Popup.ts';
import type { Room } from './Room.ts';

export class RoomsView implements View {
	socket: Socket;
	sm: ViewManager;

	element = document.getElementById('room-select-screen')!;
	pseudoInput = document.getElementById('pseudo') as HTMLInputElement;
	usernamePopup = new Popup('.username');
	roomListHtml = document.querySelector<HTMLElement>('.room-list')!;

	searchInput = document.querySelector('.search-room')!;

	roomList: Room[] = [];

	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;

		const lambdaRoom: Room = {
			capacityMax: 1,
			currentPlayers: 1,
			roomName: 'test',
			roomId: 1,
		};

		this.roomList.push(lambdaRoom);

		this.fillRooms();

		socket.on('update-rooms', data => {
			this.roomList = data.rooms;
			this.fillRooms();
		});
	}

	show(): void {
		this.element.style.display = 'flex';
	}

	clearRooms(): void {
		this.roomListHtml.innerHTML =
			'<tr>' +
			'<th>Nom de salle</th>' +
			'<th>Capacité</th>' +
			'<th>Rejoindre</th>' +
			'</tr>';
	}

	roomToHtml(room: Room): string {
		let button = '';

		button = `<button type="button">Rejoindre</button>`;

		if (room.currentPlayers >= room.capacityMax) {
			button = `<button type="button" disabled>Rejoindre</button>`;
			console.log(`Room ${room.roomId} (${room.roomName}) is full.`);
		}

		return (
			`<tr>` +
			`<td>${room.roomName}</td>` +
			`<td>${room.currentPlayers}/${room.capacityMax}</td>` +
			`<th>${button}</th>` +
			`</tr>`
		);
	}

	fillRooms() {
		this.roomList.forEach(room => {
			this.roomListHtml.innerHTML += this.roomToHtml(room);
		});
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
