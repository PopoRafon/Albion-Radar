import { PlayersDrawing } from '../Drawings/PlayersDrawing.js';
import { HarvestablesDrawing } from '../Drawings/HarvestablesDrawing.js';
import { MobsDrawing } from '../Drawings/MobsDrawing.js';
import { ChestsDrawing } from '../Drawings/ChestsDrawing.js';
import { DungeonsDrawing } from '../Drawings/DungeonsDrawing.js';

const canvasBottom = document.getElementById('bottomCanvas');
const contextBottom = canvasBottom.getContext('2d');

const settings = new Settings();

const canvasItems = document.getElementById('thirdCanvas');
const contextItems = canvasItems.getContext('2d');

const canvas = document.getElementById('drawCanvas');
const context = canvas.getContext('2d');

const harvestablesDrawing = new HarvestablesDrawing(settings);
const dungeonsHandler = new DungeonsHandler();

const itemsInfo = new ItemsInfo();
const mobsInfo = new MobsInfo();

itemsInfo.initItems();
mobsInfo.initMobs();

const chestsHandler = new ChestsHandler();
const mobsHandler = new MobsHandler();
mobsHandler.updateMobInfo(mobsInfo.moblist);


const harvestablesHandler = new HarvestablesHandler();
const playersHandler = new PlayersHandler();

const chestsDrawing = new ChestsDrawing(settings);
const mobsDrawing = new MobsDrawing(settings);
const playersDrawing = new PlayersDrawing(settings);
const dungeonsDrawing = new DungeonsDrawing(settings);
playersDrawing.updateItemsInfo(itemsInfo.iteminfo);
const drawingUtils = new DrawingUtils();

let lpX = 0.0;
let lpY = 0.0;

drawingUtils.initCanvas(canvas, context);
drawingUtils.initCanvasBottom(canvasBottom, contextBottom);

const socket = new WebSocket('ws://localhost:5002');

socket.addEventListener('open', () => console.log('Connected to the WebSocket server.'));

socket.addEventListener('message', (event) => {
	const data = JSON.parse(event.data);

	// Extract the string and dictionary from the object
	const extractedString = data.code;

	const extractedDictionary = JSON.parse(data.dictionary);

	if (extractedString === 'request') {
		onRequest(extractedDictionary['parameters']);
	}
	else {
		onEvent(extractedDictionary['parameters']);
	}
});

function onEvent(parameters) {
	const id = parseInt(parameters[0]);
	const eventCode = parameters[252];

	switch (eventCode) {
	case 1:
		playersHandler.removePlayer(id);
		mobsHandler.removeMist(id);
		mobsHandler.removeMob(id);
		dungeonsHandler.removeDungeon(id);
		chestsHandler.removeChest(id);
		break;
	case 3:
		// parameters[4] === posX, parameters[5] === posY;
		playersHandler.updatePlayerPosition(id, parameters[4], parameters[5]);
		mobsHandler.updateMistPosition(id, parameters[4], parameters[5]);
		mobsHandler.updateMobPosition(id, parameters[4], parameters[5]);
		break;
	case 27:
		playersHandler.handleNewPlayerEvent(id, parameters, settings.ignoreList, settings.settingSound);
		break;
	case 37:
		harvestablesHandler.newSimpleHarvestableObject(parameters);
		break;
	case 38:
		harvestablesHandler.newHarvestableObject(id, parameters);
		break;
	case 44:
		mobsHandler.updateEnchantEvent(parameters);
		break;
	case 58:
		harvestablesHandler.harvestFinished(parameters);
		break;
	case 86:
		playersHandler.updateItems(id, parameters);
		break;
	case 120:
		mobsHandler.NewMobEvent(parameters);
		break;
	case 201:
		playersHandler.handleMountedPlayerEvent(id, parameters);
		break;
	case 311:
		dungeonsHandler.dungeonEvent(parameters);
		break;
	case 378:
		chestsHandler.addChestEvent(parameters);
		break;
	default:
		return;
	}
}

function onRequest(parameters) {
	if (parameters[253] == 21) {
		lpX = parameters[1][0];
		lpY = parameters[1][1];
	}
};

requestAnimationFrame(gameLoop);

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	harvestablesDrawing.invalidate(context, harvestablesHandler.harvestableList);

	mobsDrawing.invalidate(context, mobsHandler.mobsList, mobsHandler.mistList);
	chestsDrawing.invalidate(context, chestsHandler.chestsList);
	dungeonsDrawing.invalidate(context, dungeonsHandler.dungeonList);
	playersDrawing.invalidate(context, playersHandler.playersInRange);
}

let previousTime = performance.now();

function gameLoop() {
	update();
	render();
	requestAnimationFrame(gameLoop);
}

function update() {
	const currentTime = performance.now();
	const deltaTime = currentTime - previousTime;
	const t = Math.min(1, deltaTime / 100);

	harvestablesHandler.removeNotInRange(lpX, lpY);
	harvestablesDrawing.interpolate(harvestablesHandler.harvestableList, lpX, lpY, t);

	mobsDrawing.interpolate(mobsHandler.mobsList, mobsHandler.mistList, lpX, lpY, t);

	chestsDrawing.interpolate(chestsHandler.chestsList, lpX, lpY, t);
	dungeonsDrawing.interpolate(dungeonsHandler.dungeonList, lpX, lpY, t);
	playersDrawing.interpolate(playersHandler.playersInRange, lpX, lpY, t);

	previousTime = currentTime;
}

function drawItems() {
	contextItems.clearRect(0, 0, canvasItems.width, canvasItems.height);

	if (settings.settingItems) {
		playersDrawing.drawItems(contextItems, canvasItems, playersHandler.playersInRange, settings.settingItemsDev);
	}
}
const intervalItems = 500;
setInterval(drawItems, intervalItems);

function checkLocalStorage() {
	settings.update(settings);
	setDrawingViews();
}

const interval = 300;
setInterval(checkLocalStorage, interval);

document.getElementById('button').addEventListener('click', function () {
	chestsHandler.chestsList = [];
	dungeonsHandler.dungeonList = [];
	harvestablesHandler.harvestableList = [];
	mobsHandler.mobsList = [];
	mobsHandler.mistList = [];
	playersHandler.playersInRange = [];
	playersDrawing.images = {};
});

setDrawingViews();

function setDrawingViews() {
	const mainWindowMarginXValue = localStorage.getItem('mainWindowMarginX');
	const mainWindowMarginYValue = localStorage.getItem('mainWindowMarginY');
	const itemsWindowMarginXValue = localStorage.getItem('itemsWindowMarginX');
	const itemsWindowMarginYValue = localStorage.getItem('itemsWindowMarginY');
	const settingItemsBorderValue = localStorage.getItem('settingItemsBorder');
	const buttonMarginXValue = localStorage.getItem('buttonMarginX');
	const buttonMarginYValue = localStorage.getItem('buttonMarginY');

	const itemsWidthValue = localStorage.getItem('itemsWidth');
	const itemsHeightValue = localStorage.getItem('itemsHeight');

	// Check if the values exist in local storage and handle them
	if (mainWindowMarginXValue !== null) {
		document.getElementById('bottomCanvas').style.left = mainWindowMarginXValue + 'px';
		document.getElementById('drawCanvas').style.left = mainWindowMarginYValue + 'px';
	}

	if (mainWindowMarginYValue !== null) {
		document.getElementById('drawCanvas').style.top = mainWindowMarginYValue + 'px';
		document.getElementById('bottomCanvas').style.top = mainWindowMarginYValue + 'px';
	}

	if (itemsWindowMarginXValue !== null) {
		document.getElementById('thirdCanvas').style.left = itemsWindowMarginXValue + 'px';
	}

	if (itemsWindowMarginYValue !== null) {
		document.getElementById('thirdCanvas').style.top = itemsWindowMarginYValue + 'px';
	}

	if (itemsWidthValue !== null) {
		document.getElementById('thirdCanvas').style.width = itemsWidthValue + 'px';
	}

	if (itemsHeightValue !== null) {
		document.getElementById('thirdCanvas').style.height = itemsHeightValue + 'px';
	}

	if (settingItemsBorderValue !== null) {
		// Apply border based on the settingItemsBorderValue
		if (settingItemsBorderValue === 'true') {

			document.getElementById('thirdCanvas').style.border = '2px solid grey';
		} else {

			document.getElementById('thirdCanvas').style.border = 'none';
		}
	}

	if (buttonMarginXValue !== null) {
		document.getElementById('button').style.left = buttonMarginXValue + 'px';
	}

	if (buttonMarginYValue !== null) {
		document.getElementById('button').style.top = buttonMarginYValue + 'px';
	}
}