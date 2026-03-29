// SpriteAnimator.ts
export class SpriteAnimator {
	private frameIndex: number = 0;
	private tickCount: number = 0;
	private readonly ticksPerFrame: number;

	private readonly frameCount: number;
	private readonly frameWidth: number;
	private readonly frameHeight: number;

	private readonly image: HTMLImageElement;

	constructor(
		image: HTMLImageElement,
		frameCount: number,
		frameWidth: number,
		frameHeight: number,
		ticksPerFrame: number = 6 // plus c'est bas plus c'est rapide
	) {
		this.image = image;
		this.frameCount = frameCount;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.ticksPerFrame = ticksPerFrame;
	}

	update() {
		this.tickCount++;
		if (this.tickCount > this.ticksPerFrame) {
			this.tickCount = 0;
			this.frameIndex = (this.frameIndex + 1) % this.frameCount;
		}
	}

	draw(
		ctx: CanvasRenderingContext2D,
		dx: number,
		dy: number,
		width: number,
		height: number
	) {
		ctx.drawImage(
			this.image,
			this.frameIndex * this.frameWidth,
			0,
			this.frameWidth,
			this.frameHeight,
			dx,
			dy,
			width,
			height
		);
	}
}
