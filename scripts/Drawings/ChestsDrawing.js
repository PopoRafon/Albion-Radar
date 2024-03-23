export class ChestsDrawing extends DrawingUtils {
	constructor(Settings) {
		super(Settings);
	}

	interpolate(chests, lpX, lpY, t) {
		for (const chestOne of chests) {
			const hX = -1 * chestOne.posX + lpX;
			const hY = chestOne.posY - lpY;

			if (chestOne.hY == 0 && chestOne.hX == 0) {
				chestOne.hX = hX;
				chestOne.hY = hY;

			}

			chestOne.hX = this.lerp(chestOne.hX, hX, t);
			chestOne.hY = this.lerp(chestOne.hY, hY, t);
		}
	}

	invalidate(ctx, chests) {
		for (const chestOne of chests) {
			const point = this.transformPoint(chestOne.hX, chestOne.hY);

			if (this.settings.chestGreen && chestOne.name.toLowerCase().includes('green') || chestOne.name.toLowerCase().includes('standard')) {
				this.drawImageCustom(ctx, point.x, point.y, 'green', 50);
			} else if (this.settings.chestGreen && chestOne.name.toLowerCase().includes('uncommon') || chestOne.name.toLowerCase().includes('blue')) {
				this.drawImageCustom(ctx, point.x, point.y, 'blue', 50);
			} else if (this.settings.chestGreen && chestOne.name.toLowerCase().includes('rare') || chestOne.name.toLowerCase().includes('purple')) {
				this.drawImageCustom(ctx, point.x, point.y, 'rare', 50);
			} else if (this.settings.chestGreen && chestOne.name.toLowerCase().includes('legendary') || chestOne.name.toLowerCase().includes('yellow')) {
				this.drawImageCustom(ctx, point.x, point.y, 'legendary', 50);
			}
		}
	}
}