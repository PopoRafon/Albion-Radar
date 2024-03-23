class Chest {
	constructor(id, posX, posY, name) {
		this.id = id;
		this.posX = posX;
		this.posY = posY;
		this.name = name;
		this.hX = 0;
		this.hY = 0;
	}
}

class ChestsHandler {
	constructor() {
		this.chestsList = [];
	}

	addChest(id, posX, posY, name) {
		const newChest = new Chest(id, posX, posY, name);

		if (!this.chestsList.some(chest => chest.id === newChest.id)) {
			this.chestsList.push(newChest);
		}
	}

	removeChest(id) {
		this.chestsList = this.chestsList.filter(chest => chest.id !== id);
	}

	addChestEvent(Parameters) {
		const chestId = Parameters[0];
		const chestsPosition = Parameters[1];
		let chestName = Parameters[3];

		if (chestName.toLowerCase().includes('mist')) {
			chestName = Parameters[4];
		}

		this.addChest(chestId, chestsPosition[0], chestsPosition[1], chestName);
	}
}
