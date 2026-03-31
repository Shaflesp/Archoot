import { Entite } from './Entite.ts';
import type { Player } from '../../../server/Entity/Player.ts';

export interface WebCable {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	life: number;
	maxLife: number;
}

export default class Mygalomane extends Entite {
	target = null;
	name = 'Mygalomane';
	width = 200;
	height = 200;
	x = this.boundWidth / 2 - this.width / 2;
	y = this.boundHeight / 2 - this.height / 2;

	speed = 3;
	movementSpeed = 0;
	readonly baseSpeed: number = 3;
	readonly baseMovementSpeed: number = 0;

	health = 50;
	maxHp;
	damage = 1;
	shootSpeed = 3;

	private dirX = 1;
	private dirY = 1;

	cables: WebCable[] = [];
	private lastBounce: { x: number; y: number } | null = null;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;
	}

	move(): void {
		this.x += this.dirX * this.speed - 1;
		this.y += this.dirY * (this.speed + 5);

		let bounced = false;

		/* Rebond haut bas */
		if (this.y <= 0) {
			this.dirY = 1;
			this.y = 0;
			bounced = true;
		} else if (this.y + this.height >= this.boundHeight) {
			this.dirY = -1;
			this.y = this.boundHeight - this.height;
			bounced = true;
		}

		/* Rebond gauche droite */
		if (this.x <= 0) {
			this.dirX = 1;
			this.x = 0;
			bounced = true;
		} else if (this.x + this.width >= this.boundWidth) {
			this.dirX = -1;
			this.x = this.boundWidth - this.width;
			bounced = true;
		}

		if (bounced) {
			const centerX = this.x + this.width / 2;
			const centerY = this.y + this.height / 2;

			if (this.lastBounce) {
				this.cables.push({
					startX: this.lastBounce.x,
					startY: this.lastBounce.y,
					endX: centerX,
					endY: centerY,
					life: 300,
					maxLife: 300,
				});
			} else {
				this.cables.push({
					startX: this.boundWidth / 2,
					startY: this.boundHeight / 2,
					endX: centerX,
					endY: centerY,
					life: 300,
					maxLife: 300,
				});
			}

			this.lastBounce = { x: centerX, y: centerY };
		}

		this.cables.forEach(c => c.life--);
		this.cables = this.cables.filter(c => c.life > 0);
	}

	hitPlayers(players: Map<string, Player>): void {
		const cableThickness = 5;

		this.cables.forEach(cable => {
			players.forEach(player => {
				if (!player.active) return;

				const px = player.x + player.width / 2;
				const py = player.y + player.height / 2;

				const lineLenSq = Math.pow(cable.endX - cable.startX, 2) + Math.pow(cable.endY - cable.startY, 2);
				if (lineLenSq === 0) return;

				let t = ((px - cable.startX) * (cable.endX - cable.startX) + (py - cable.startY) * (cable.endY - cable.startY)) / lineLenSq;
				t = Math.max(0, Math.min(1, t));

				const closestX = cable.startX + t * (cable.endX - cable.startX);
				const closestY = cable.startY + t * (cable.endY - cable.startY);

				const dist = Math.hypot(px - closestX, py - closestY);

				if (dist < player.width / 2 + cableThickness) {
					player.takeDamage(this.damage);
				}
			});
		});
	}

	reset(): void {
		this.width = 200;
		this.height = 200;
		this.x = this.boundWidth / 2 - this.width / 2;
		this.y = this.boundHeight / 2 - this.height / 2;
		this.health = 50;
		this.maxHp = this.health;

		this.active = true;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;
	}

	getAsJson() {
		return {
			...super.getAsJson(),
			cables: this.cables,
		};
	}
}
