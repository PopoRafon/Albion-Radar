class Player {
	constructor(posX, posY, id, nickname, guildName1, currentHealth, initialHealth, items) {
		this.posX = posX;
		this.posY = posY;
		this.oldPosX = posX;
		this.oldPosY = posY;
		this.id = id;
		this.nickname = nickname;
		this.guildName = guildName1;
		this.hX = 0;
		this.hY = 0;
		this.currentHealth = currentHealth;
		this.initialHealth = initialHealth;
		this.items = items;
		this.mounted = false; // Initialize mounted status as false
	}

	setMounted(mounted) {
		this.mounted = mounted;
	}
}

class PlayersHandler {
	constructor() {
		this.playersInRange = [];
		this.localPlayer = new Player();
		this.invalidate = false;
	}

	getPlayersInRange() {
		// Assume you have implemented a read lock mechanism
		// SharedLocks.playerHandlerLock.readLock().lock();
		try {
			return [...this.playersInRange]; // Create a copy of the array
		} finally {
			// Unlock mechanism
			// SharedLocks.playerHandlerLock.readLock().unlock();
		}
	}

	updateItems(id, Parameters) {
		const items = Parameters[2] ?? null;

		if (items != null) {
			this.playersInRange.forEach(playerOne => {
				if (playerOne.id === id) {
					playerOne.items = items;
				}
			});
		}
	}

	handleNewPlayerEvent(id, parameters, ignoreList, sound) {
		const nickname = parameters[1];
		const guildName = parameters[8] ?? '';
		const ally = String(parameters[48]);

		for (const item of ignoreList) {
			if (item.type == 'Player' && item.value.toLowerCase() == nickname.toLowerCase()) {
				return;
			}

			if (!guildName && item.type == 'Guild' && item.value.toLowerCase() == guildName.toLowerCase()) {
				return;
			}

			if (ally != 'undefined' && item.type == 'Ally' && item.value.toLowerCase() == ally.toLowerCase()) {
				return;
			}
		}

		const [posX, posY] = parameters[14];
		const currentHealth = parameters[20];
		const initialHealth = parameters[21];
		const items = parameters[38]['data'] ?? parameters[38];

		this.addPlayer(posX, posY, id, nickname, guildName, currentHealth, initialHealth, items);
	}

	handleMountedPlayerEvent(id, parameters) {
		const ten = parameters[10];
		const mounted = parameters[11];

		if (mounted || ten === -1) {
			this.updatePlayerMounted(id, true);
		} else {
			this.updatePlayerMounted(id, false);
		}
	}

	addPlayer(posX, posY, id, nickname, guildName, currentHealth, initialHealth, items) {
		// Assume you have implemented a write lock mechanism
		// SharedLocks.playerHandlerLock.writeLock().lock();
		const existingPlayer = this.playersInRange.find(player => player.id === id);

		if (!existingPlayer) {
			const player = new Player(posX, posY, id, nickname, guildName, currentHealth, initialHealth, items);
			this.playersInRange.push(player);
		}
	}

	updateLocalPlayerNextPosition(posX, posY) {
		// TODO: Implement update local player next position
		throw new Error('Not implemented');
	}

	updatePlayerMounted(id, mounted) {
		for (const player of this.playersInRange) {
			if (player.id === id) {
				player.setMounted(mounted);
				break;
			}
		}
	}

	removePlayer(id) {
		this.playersInRange = this.playersInRange.filter(player => player.id !== id);
	}

	updateLocalPlayerPosition(posX, posY) {
		// Implement a local player lock mechanism
		this.localPlayer.posX = posX;
		this.localPlayer.posY = posY;
	}

	localPlayerPosX() {
		// Implement a local player lock mechanism
		return this.localPlayer.posX;
	}

	localPlayerPosY() {
		// Implement a local player lock mechanism
		return this.localPlayer.posY;
	}

	updatePlayerPosition(id, posX, posY) {
		// Assume you have implemented a write lock mechanism
		// SharedLocks.playerHandlerLock.writeLock().lock();
		for (const player of this.playersInRange) {
			if (player.id === id) {
				player.posX = posX;
				player.posY = posY;
			}
		}
	}

	updatePlayerHealth(id, currentHealth) {
		for (const player of this.playersInRange) {
			if (player.id === id) {
				player.currentHealth = currentHealth;
				break;
			}
		}
	}

	updatePlayerInitialHealth(id, currentHealth, initialHealth) {
		for (const player of this.playersInRange) {
			if (player.id === id) {
				player.currentHealth = currentHealth;
				player.initialHealth = initialHealth;
				break;
			}
		}
	}

	clear() {
		this.playersInRange = [];
	}
}