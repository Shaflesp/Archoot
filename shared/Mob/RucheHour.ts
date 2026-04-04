import { Entite } from './Entite.ts';
import type { Bullet } from '../Entity/Bullet.ts';

export default class RucheHour extends Entite {
	name = 'Ruche Hour';
	width = 400;
	height = 400;

	x = -this.width + 1;
	y = this.boundHeight / 4;

	speed = 1;
	movementSpeed = 1;
	readonly baseSpeed: number = 1;
	readonly baseMovementSpeed: number = 1;

	health = 150;
	maxHp;
	damage = 1;
	shootSpeed = 10;
	target = null;

	private currentAngle: number = 0;
	private rotationSpeed: number = 0.1;
	private numberOfRays: number = 8;
	shootTimer: number = 0;

	phase: 'green' | 'orange' | 'red' = 'green';
	phaseTimer: number = 0;

	constructor(boundWith: number, boundHeight: number) {
		super(boundWith, boundHeight);
		this.maxHp = this.health;
	}

	move(): void {
		if (this.x < 0) {
			this.x += this.speed;
			if (this.x > 0) {
				this.x = 0;
			}
		} else {
			this.currentAngle += this.rotationSpeed;
			this.updatePhase();
		}
	}

	private updatePhase(): void {
		this.phaseTimer++;

		if (this.phase === 'green' && this.phaseTimer >= 400) {
			// ~6.5 secondes
			this.phase = 'orange';
			this.phaseTimer = 0;
		} else if (this.phase === 'orange' && this.phaseTimer >= 120) {
			// 2 secondes
			this.phase = 'red';
			this.phaseTimer = 0;
		} else if (this.phase === 'red' && this.phaseTimer >= 180) {
			// 3 secondes
			this.phase = 'green';
			this.phaseTimer = 0;
		}
	}

	getVectors(): { dx: number; dy: number }[] {
		const vectors = [];
		for (let i = 0; i < this.numberOfRays; i++) {
			const angle = this.currentAngle + (i * Math.PI * 2) / this.numberOfRays;
			vectors.push({
				dx: Math.cos(angle),
				dy: Math.sin(angle),
			});
		}
		return vectors;
	}

	shoot(_acquireBullet: () => Bullet | null): void {
		if (this.x !== 0) return;
		if (this.phase !== 'green' && this.phase !== 'orange') return;

		this.shootTimer++;
		if (this.shootTimer < 20) return;
		this.shootTimer = 0;

		this.getVectors().forEach((vec: { dx: number; dy: number }) => {
			const bullet = _acquireBullet();
			if (!bullet) return;

			bullet.fire(
				this.x + this.width / 2 - bullet.width / 2,
				this.y + this.height / 2 - bullet.height / 2,
				vec.dx,
				vec.dy,
				this.name,
				this.damage,
				4
			);
		});
	}

	takeDamage(amount: number): void {
		this.health -= amount;
		if (this.health < 0) this.health = 0;
	}

	reset(): void {
		this.width = 400;
		this.height = 400;
		this.x = -this.width + 1;
		this.y = this.boundHeight / 4;
		this.health = 150;
		this.maxHp = this.health;

		this.active = true;

		this.speed = this.baseSpeed;
		this.movementSpeed = this.baseMovementSpeed;
	}

	getAsJson() {
		return {
			...super.getAsJson(),
			phase: this.phase,
		};
	}
}
