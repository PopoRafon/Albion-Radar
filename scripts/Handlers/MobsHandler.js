class Mob {
	constructor(id, typeId, posX, posY, health, enchantmentLevel, rarity) {
		this.id = id;
		this.typeId = typeId;
		this.posX = posX;
		this.posY = posY;
		this.health = health;
		this.enchantmentLevel = enchantmentLevel;
		this.rarity = rarity;
		this.tier = 0;
		this.type = 2;
		this.name = null;
		this.exp = 0;
		this.hX = 0;
		this.hY = 0;
	}
}

class Mist {
	constructor(id, posX, posY, name, enchant) {
		this.id = id;
		this.posX = posX;
		this.posY = posY;
		this.name = name;
		this.enchant = enchant;
		this.hX = 0;
		this.hY = 0;
		this.type = name.toLowerCase().includes('solo') ? 0 : 1;
	}
}

class MobsHandler {
	constructor() {
		this.mobsList = [];
		this.mistList = [];
		this.mobinfo = {};
	}

	updateMobInfo(newData) {
		this.mobinfo = newData;
	}

	clear() {
		this.mobsList = [];
		this.mistList = [];
	}

	NewMobEvent(parameters) {
		const id = parameters[0];
		const typeId = parameters[1];
		const [posX, posY] = parameters[7];
		const health = parameters[13];
		const enchant = parameters[33];
		const name = parameters[32];
		let rarity = parseInt(parameters[19]);

		if (isNaN(rarity)) {
			rarity = 1;
		}

		if (name) {
			this.addMist(id, posX, posY, name, enchant);
		} else {
			this.addMob(id, typeId, posX, posY, health, 0, rarity);
		}
	}

	addMob(id, typeId, posX, posY, health, enchant, rarity) {
		const newMob = new Mob(id, typeId, posX, posY, health, enchant, rarity);

		if (this.mobinfo[typeId] != null) {
			const mobsInfo = this.mobinfo[typeId];

			newMob.tier = mobsInfo[0];
			newMob.type = mobsInfo[1];
			newMob.name = mobsInfo[2];
		}

		if (!this.mobsList.includes(newMob)) {
			this.mobsList.push(newMob);
		}
	}

	addMist(id, posX, posY, name, enchant) {
		const newMist = new Mist(id, posX, posY, name, enchant);

		if (!this.mistList.some(mist => mist.id === newMist.id)) {
			this.mistList.push(newMist);
		}
	}

	removeMist(id) {
		this.mistList = this.mistList.filter(mist => mist.id !== id);
	}

	updateMistPosition(id, posX, posY) {
		this.mistList.forEach(mist => {
			if (mist.id === id) {
				mist.posX = posX;
				mist.posY = posY;
			}
		});
	}

	updateMistEnchantmentLevel(mistId, enchantmentLevel) {
		const mistToUpdate = this.mistList.find(mist => mist.id === mistId);

		if (mistToUpdate) {
			mistToUpdate.enchant = enchantmentLevel;
		}
	}

	updateMobEnchantmentLevel(mobId, enchantmentLevel) {
		for (const mob of this.mobsList) {
			if (mob.id === mobId) {
				mob.enchantmentLevel = enchantmentLevel;
				break;
			}
		}
	}

	updateEnchantEvent(parameters) {
		const mobId = parameters[0];
		const enchantmentLevel = parameters[1];
		this.updateMobEnchantmentLevel(mobId, enchantmentLevel);
	}

	removeMob(id) {
		this.mobsList = this.mobsList.filter(mob => mob.id !== id);
	}

	getMobList() {
		return [...this.mobsList];
	}

	updateMobPosition(id, posX, posY) {
		for (const mob of this.mobsList) {
			if (mob.id === id) {
				mob.posX = posX;
				mob.posY = posY;
				break;
			}
		}
	}
}
