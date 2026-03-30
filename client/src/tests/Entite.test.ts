import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MockEntite } from './mocks/MockEntite.ts';

describe('Entite', () => {
	it('should take damage correctly', () => {
		const e = new MockEntite(100, 100);

		e.takeDamage(30);

		assert.equal(e.health, 70);
	});

	it('should not put health below 0', () => {
		const e = new MockEntite(100, 100);

		e.takeDamage(200);

		assert.equal(e.health, 0);
	});

	it('should detect deaths when entity is dead', () => {
		const e = new MockEntite(100, 100);

		e.takeDamage(100);

		assert.equal(e.isDead(), true);
	});

	it('should not detect deaths when entity is alive', () => {
		const e = new MockEntite(100, 100);

		assert.equal(e.isDead(), false);
	});

	it('should detect collisions', () => {
		const a = new MockEntite(100, 100);
		const b = new MockEntite(100, 100);

		b.x = 5;
		b.y = 5;

		assert.equal(a.collidesWith(b), true);
	});

	it('should detect no collision when entities are apart', () => {
		const a = new MockEntite(100, 100);
		const b = new MockEntite(100, 100);

		b.x = 100;
		b.y = 100;

		assert.equal(a.collidesWith(b), false);
	});

	it('should detect no collision when entities are side to side', () => {
		const a = new MockEntite(100, 100);
		const b = new MockEntite(100, 100);

		b.x = a.width;
		b.y = 0;

		assert.equal(a.collidesWith(b), false);
	});

	it('should have a functional toString', () => {
		const e = new MockEntite(100, 100);

		assert.equal(e.toString(), 'mock (HP: 100)');
	});

	it('should save json correctly', () => {
		const e = new MockEntite(100, 100);

		const json = e.getAsJson();

		assert.equal(json.name, 'mock');
		assert.equal(json.hp, 100);
		assert.equal(json.maxHp, 100);
	});
});
