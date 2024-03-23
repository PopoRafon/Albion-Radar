class Dungeon {
	constructor(id, posX, posY, name, enchant) {
		this.id = id;
		this.posX = posX;
		this.posY = posY;
		this.name = name;
		this.enchant = enchant;
		this.type = name.toLowerCase().includes('solo') ? 0 : 1;
		this.hY = 0;
		this.hX = 0;
	}
}

class DungeonsHandler {
	constructor() {
		this.dungeonList = [];
	}

	addDungeon(id, posX, posY, name, enchant) {
		const newDungeon = new Dungeon(id, posX, posY, name, enchant);

		if (!this.dungeonList.some(dungeon => dungeon.id === newDungeon.id)) {
			this.dungeonList.push(newDungeon);
		}
	}

	removeDungeon(id) {
		this.dungeonList = this.dungeonList.filter(dungeon => dungeon.id !== id);
	}

	updateDungeonPosition(id, posX, posY) {
		this.dungeonList.forEach(p => {
			if (p.id === id) {
				p.PosX = posX;
				p.PosY = posY;
			}
		});
	}

	dungeonEvent(parameters) {
		const id = parameters[0];
		const [posX, posY] = parameters[1];
		const name = parameters[3];
		const enchant = +parameters[5];

		this.addDungeon(id, posX, posY, name, enchant);
	}

	updateDungeonEnchantmentLevel(dungeonId, enchantmentLevel) {
		const dungeon = this.dungeonList.find(dungeon => dungeon.id === dungeonId);

		if (dungeon) {
			dungeon.enchant = enchantmentLevel;
		}
	}
}