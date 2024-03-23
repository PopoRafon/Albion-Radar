﻿class DrawingUtils {
	constructor(settings) {
		this.settings = settings;
		this.fontSize = '12px';
		this.fontFamily = 'Arial';
		this.textColor = 'white';
		this.images = [];
	}

	initCanvasBottom(canvasBottom, contextBottom) {
		this.fillCtx(canvasBottom, contextBottom);
		this.drawBoard(canvasBottom, contextBottom);
	}

	drawFilledCircle(context, x, y, radius, color) {
		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI);
		context.fillStyle = color;
		context.fill();
	}

	initCanvas(canvas, context) {

	}

	fillCtx(canvasBottom, contextBottom) {
		contextBottom.fillStyle = '#1a1c23';
		contextBottom.fillRect(0, 0, canvasBottom.width, canvasBottom.height);
		this.drawFilledCircle(contextBottom, canvasBottom.width / 2, canvasBottom.height / 2, 10, 'blue');
	}

	drawBoard(canvasBottom, contextBottom) {
		const bw = canvasBottom.width;
		const bh = canvasBottom.height;
		const p = 0;
		const totalSpace = canvasBottom.height / 10;

		for (let x = 0; x <= bw; x += totalSpace) {
			contextBottom.moveTo(0.5 + x + p, p);
			contextBottom.lineTo(0.5 + x + p, bh + p);
		}

		for (let x = 0; x <= bh; x += 50) {
			contextBottom.moveTo(p, 0.5 + x + p);
			contextBottom.lineTo(bw + p, 0.5 + x + p);
		}

		contextBottom.strokeStyle = 'grey';
		contextBottom.stroke();
	}

	lerp(a, b, t) {
		return a + (b - a) * t;
	}

	drawImageCustom(ctx, x, y, drawTo, size) {
		if (!drawTo || drawTo.toLowerCase().includes('undefined')) {
			return;
		}

		const src = '/images/Resources/' + drawTo + '.png';

		if (this.settings.images[src]) {
			ctx.drawImage(this.settings.images[src], x - size / 2, y - size / 2, size, size,);
		} else {
			this.settings.preloadImageAndAddToList(src);
		}
	}

	transformPoint(x, y) {
		const angle = -0.7071;
		let newX = x * angle - y * angle;
		let newY = x * angle + y * angle;
		newX *= 4;
		newY *= 4;

		newX += 250;
		newY += 250;

		return { x: newX, y: newY };
	}

	drawText(xTemp, yTemp, text, ctx) {
		ctx.font = this.fontSize + ' ' + this.fontFamily;
		ctx.fillStyle = this.textColor;

		let x = xTemp;
		let y = yTemp;

		const textWidth = ctx.measureText(text).width;

		ctx.fillText(text, x - textWidth / 2, y);
	}

	drawTextItems(xTemp, yTemp, text, ctx, size, color) {
		ctx.font = size + ' ' + this.fontFamily;
		ctx.fillStyle = color;

		let x = xTemp;
		let y = yTemp;

		ctx.fillText(text, x, y);
	}
}
