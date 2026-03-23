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
	roomListHtml = document.querySelector<HTMLElement>('.room-list tbody')!;

	searchInput = document.querySelector<HTMLInputElement>('.search-room')!;

	roomList: Room[] = [];

	constructor(sm: ViewManager, socket: Socket) {
		this.socket = socket;
		this.sm = sm;

		this.element
			.querySelector<HTMLAnchorElement>('.back-button')
			?.addEventListener('click', () => {
				console.log('Bouton retour cliqué (via Rooms)');

				sm.show('home-screen');
			});

		this.filterRooms();

		socket.on('update-rooms', data => {
			this.roomList = data.rooms;
			this.filterRooms();
		});

		this.searchInput.addEventListener('input', () => {
			this.filterRooms();
		});
	}

	show(): void {
		this.element.style.display = 'flex';
	}

	clearRooms(): void {
		this.roomListHtml.innerHTML = '';
	}

	roomToHtml(room: Room): string {
		// plus utile
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
			`<td>${button}</td>` +
			`</tr>`
		);
	}

	fillRooms(rooms: Room[]) {
		this.clearRooms();
		rooms.forEach(room => {
			const tr = document.createElement('tr');

			const tdName = document.createElement('td');
			tdName.textContent = room.roomName;

			const tdCount = document.createElement('td');
			tdCount.textContent = `${room.currentPlayers}/${room.capacityMax}`;

			const tdButton = document.createElement('td');
			const button = document.createElement('button');
			button.textContent = 'Rejoindre';

			if (room.currentPlayers >= room.capacityMax) {
				button.disabled = true;
			}

			button.addEventListener('click', () => {
				this.socket.emit('join-room', room.roomId);
				this.sm.show('game-screen');
			});

			tdButton.appendChild(button);

			tr.appendChild(tdName);
			tr.appendChild(tdCount);
			tr.appendChild(tdButton);

			this.roomListHtml.appendChild(tr);
		});
	}

	filterRooms() {
		const val = this.searchInput.value.toLowerCase();

		const newRooms = this.roomList.filter(r =>
			r.roomName.toLowerCase().includes(val)
		);

		this.fillRooms(newRooms);
	}

	hide(): void {
		this.element.style.display = 'none';
	}
}
