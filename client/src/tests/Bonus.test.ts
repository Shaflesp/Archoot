import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MockBonus } from './mocks/MockBonus.ts';
import { Player } from '../../../shared/Entity/Player.ts';

describe('Bonus', () => {
	it('should initialize correctly', () => {
		const b = new MockBonus(10, 20);

		assert.equal(b.x, 10);
		assert.equal(b.y, 20);
		assert.equal(b.width, 50);
		assert.equal(b.height, 50);
		assert.equal(b.active, false);
	});

	it('should have correct properties', () => {
		const b = new MockBonus(0, 0);

		assert.equal(b.name, 'mockBonus');
		assert.equal(b.power, 5);
		assert.equal(b.img, 'mock.png');
	});

	it('should save json correctly', () => {
		const b = new MockBonus(15, 25);

		const json = b.getAsJSON();

		assert.deepEqual(json, {
			name: 'mockBonus',
			x: 15,
			y: 25,
			width: 50,
			height: 50,
			img: 'mock.png',
		});
	});

	it('should be activatable', () => {
		const b = new MockBonus(0, 0);

		b.active = true;

		assert.equal(b.active, true);
	});

	it('should not throw an error when bonus is given', () => {
		const a = new Player('1', 'JOHN_ARCHOOT', 500, 500);
		const b = new MockBonus(0, 0);

		b.giveBonus(a);

		assert.ok(true);
	});

	it('should modify player stats and deactivate when giving a bonus', () => {
		const a = new Player('1', 'JOHN_ARCHOOT', 500, 500);
		const b = new MockBonus(10, 20);

		const originalDmg = a.damage;

		b.active = true;
		b.giveBonus(a);

		assert.equal(b.active, false);

		assert.equal(a.bonusList.length, 1);
		assert.equal(a.bonusList[0], b);

		assert.equal(a.damage, originalDmg + b.power);
	});
});
