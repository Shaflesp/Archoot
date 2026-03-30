import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Player } from '../../../server/Entity/Player.ts';
import { MockEntite } from './mocks/MockEntite.ts';

describe('Player', () => {
	it('should initialize correctly', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		assert.equal(p.identifier, '1');
		assert.equal(p.username, 'JOHN_ARCHOOT');
		assert.equal(p.lives, 5);
		assert.equal(p.active, true);
		assert.equal(p.damage, 1);
	});

	it('should move correctly within bounds', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		const oldX = p.x;
		const oldY = p.y;

		p.move(1, 1);

		assert.equal(p.x, oldX + p.movementSpeed);
		assert.equal(p.y, oldY + p.movementSpeed);
		assert.equal(p.lastDx, 1);
		assert.equal(p.lastDy, 1);
	});

	it('should not move outside of bounds', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		p.move(99999, 99999);

		assert.ok(p.x < 99999);
		assert.ok(p.y < 99999);
	});

	it('should collide with entities', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);
		const e = new MockEntite(100, 100);

		e.x = p.x;
		e.y = p.y;

		assert.equal(p.collidesWith(e), true);
	});

	it('shouldnt detect collisions when there arent any', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);
		const e = new MockEntite(100, 100);

		e.x = 1000;
		e.y = 1000;

		assert.equal(p.collidesWith(e), false);
	});

	it('should be invincible after damage', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		const before = p.lives;
		p.takeDamage(2);
		assert.equal(p.lives, before - 2);

		p.takeDamage(2);
		assert.equal(p.lives, before - 2);
	});

	it('should die when lives reach 0', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		p.takeDamage(10);
		assert.equal(p.lives, 0);
		assert.equal(p.active, false);
		assert.equal(p.isDead(), true);
	});

	it('should not be dead when its lives are above 0', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);

		p.takeDamage(1);
		assert.equal(p.isDead(), false);
	});

	it('should return correct info with getAsJson even after moving', () => {
		const p = new Player('1', 'JOHN_ARCHOOT', 500, 500);
		p.move(1, -1);

		const json = p.getAsJson();

		assert.equal(json.identifier, '1');
		assert.equal(json.username, 'JOHN_ARCHOOT');
		assert.equal(json.x, p.x);
		assert.equal(json.y, p.y);
		assert.equal(json.dx, 1);
		assert.equal(json.dy, -1);
		assert.equal(json.lives, p.lives);
		assert.equal(json.active, p.active);
	});
});
