import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Bullet } from '../../../server/Entity/Bullet.ts';
import { Player } from '../../../server/Entity/Player.ts';

describe('Bullet', () => {
	it('should fire correctly', () => {
		const b = new Bullet(500, 500);
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		b.fire(p.x, p.y, 1, 0, p.identifier, 5, 10);

		assert.equal(b.x, p.x);
		assert.equal(b.y, p.y);
		assert.equal(b.dx, 1);
		assert.equal(b.dy, 0);
		assert.equal(b.ownerId, p.identifier);
		assert.equal(b.active, true);
		assert.equal(b.damage, 5);
		assert.equal(b.speed, 10);
	});

	it('should update position based on speed and direction', () => {
		const b = new Bullet(500, 500);
		b.fire(0, 0, 1, 1, '1', 1, 5);

		b.update();

		assert.equal(b.x, 5);
		assert.equal(b.y, 5);
	});

	it('should deactivate when out of bounds', () => {
		const b = new Bullet(100, 100);
		b.fire(9999, 99999, 1, 0, '1', 1, 20);

		b.update();

		assert.equal(b.active, false);
	});

	it('should return correct info with getAsJson even after firing', () => {
		const b = new Bullet(500, 500);
		b.fire(10, 20, 1, -1, '1', 2, 5);

		const json = b.getAsJson();
		assert.deepEqual(json, {
			x: 10,
			y: 20,
			width: 30,
			height: 30,
			dx: 1,
			dy: -1,
			ownerId: '1',
			active: true,
		});
	});

	it('should clear all fields on reset', () => {
		const b = new Bullet(500, 500);
		b.fire(10, 10, 1, 1, '1', 2, 5);

		b.reset();

		assert.equal(b.x, 0);
		assert.equal(b.y, 0);
		assert.equal(b.dx, 0);
		assert.equal(b.dy, 0);
		assert.equal(b.ownerId, '');
		assert.equal(b.active, false);
	});

	it('should collide with player', () => {
		const b = new Bullet(500, 500);
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		b.fire(p.x, p.y, 0, 0, '2', 1, 0);

		assert.equal(p.collidesWith(b), true);
	});
});
