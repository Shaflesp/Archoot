export class SpriteAnimator {
	private frameIndex: number = 0;
	private tickCount: number = 0;

	private image: HTMLImageElement;

	private frameCount: number;
	private frameWidth: number;
	private frameHeight: number;
	private ticksPerFrame: number = 6;

	private loop: boolean;
	private done: boolean = false;

	constructor(
		image: HTMLImageElement,
		frameCount: number,
		frameWidth: number,
		frameHeight: number,
		ticksPerFrame: number = 6,
		loop: boolean = true // ADD THIS
	) {
		this.image = image;
		this.frameCount = frameCount;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.ticksPerFrame = ticksPerFrame;
		this.loop = loop;
	}

	update() {
		if (this.done) return;

		this.tickCount++;
		if (this.tickCount >= this.ticksPerFrame) {
			this.tickCount = 0;

			if (this.frameIndex < this.frameCount - 1) {
				this.frameIndex++;
			} else if (this.loop) {
				this.frameIndex = 0; // only loop if allowed
			} else {
				this.done = true; // stop here
			}
		}
	}

	isDone(): boolean {
		return this.done;
	}

	draw(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		ctx.drawImage(
			this.image,
			this.frameIndex * this.frameWidth,
			0,
			this.frameWidth,
			this.frameHeight,
			x,
			y,
			width,
			height
		);
	}
}
