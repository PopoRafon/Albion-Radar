class Harvestable {
	constructor(id, type, tier, posX, posY, charges, size) {
		this.id = id;
		this.type = type;
		this.tier = tier;
		this.posX = posX;
		this.posY = posY;
		this.charges = charges;
		this.size = size;
		this.hX = 0;
		this.hY = 0;
	}

	setCharges(charges) {
		this.charges = charges;
	}
}

class HarvestablesHandler {
	constructor() {
		this.harvestableList = [];
	}

	addHarvestable(id, type, tier, posX, posY, charges, size) {
		const newHarvestable = new Harvestable(id, type, tier, posX, posY, charges, size);
		const index = this.harvestableList.findIndex(harvestable => harvestable.id === newHarvestable.id);

		if (index === -1) {
			this.harvestableList.push(newHarvestable);
		} else {
			this.harvestableList[index].setCharges(charges);
		}
	}

	harvestFinished(Parameters) {
		const id = Parameters[3];
		const count = Parameters[5];

		this.updateHarvestable(id, count);
	}

	newHarvestableObject(id, parameters) {
		const type = parameters[5];
		const tier = parameters[7];
		const [posX, posY] = parameters[8];
		const enchant = parameters[10] ?? 0;
		const size = parameters[11] ?? 0;

		this.addHarvestable(id, type, tier, posX, posY, enchant, size);
	}

	base64ToArrayBuffer(base64) {
		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);

		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return bytes;
	}

	newSimpleHarvestableObject(Parameters) {
		const a0 = Parameters[0];

		if (a0.length === 0) {
			return;
		}

		const a1 = Parameters[1]['data'];
		const a2 = Parameters[2]['data'];
		const a3 = Parameters[3];
		const a4 = Parameters[4]['data'];

		for (let i = 0; i < a0.length; i++) {
			const id = a0[i];
			const type = a1[i];
			const tier = a2[i];
			const posX = a3[i * 2];
			const posY = a3[i * 2 + 1];
			const count = a4[i];

			this.addHarvestable(id, type, tier, posX, posY, 0, count);
		}
	}

	removeNotInRange(lpX, lpY) {
		this.harvestableList = this.harvestableList.filter(
			(harvestable) => this.calculateDistance(lpX, lpY, harvestable.posX, harvestable.posY) <= 80
		);

		this.harvestableList = this.harvestableList.filter(harvestable => harvestable.size !== undefined);
	}

	calculateDistance(lpX, lpY, posX, posY) {
		const deltaX = lpX - posX;
		const deltaY = lpY - posY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		return distance;
	}

	removeHarvestable(id) {
		this.harvestableList = this.harvestableList.filter(harvestable => harvestable.id !== id);
	}

	getHarvestableList() {
		return [...this.harvestableList];
	}

	updateHarvestable(harvestableId, count) {
		const harvestable = this.harvestableList.find(harvestable => harvestable.id == harvestableId);

		if (harvestable) {
			harvestable.size = harvestable.size - count;
		}
	}

	clear() {
		this.harvestableList = [];
	}
}