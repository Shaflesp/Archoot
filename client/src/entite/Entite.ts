export interface Entite {
    identifier: string;
    x: number;
    y: number;
    movementSpeed: number;
    health: number;
    damage: number;
    shootSpeed: number;

    move(): void;
    getAsJson(): string;
    takeDamage(amount: number): void;
    // healing(heart: number): void;
    // changeShootSpeed(newSpeed: number): void;
    // changeMovementSpeed(speedBonus: number): void;
    // changeDamage(damageBonus: number): void;
}