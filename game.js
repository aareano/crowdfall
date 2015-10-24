var BASE_SIZE = 15;
var BOARD_HEIGHT = 50;

var SINGLE_UP = 9;
var SINGLE_DOWN = 13;
var DOUBLE_UP = 53;
var DOUBLE_DOWN = 59;

var FEED_BORDER = 10;
var BOARD_BORDER = 10;

var BOTBAR_HEIGHT = 100;
var RIGHTBAR_WIDTH = 250;

var buttons;
var boardBack;

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-wrapper', {
	preload: preload,
	create: create,
	update: update,
	render: render
});

var teamLeft = {};
teamLeft.nameID = "Left";
teamLeft.instQueue = [];
teamLeft.boxSets = [];
teamLeft.position = 0;

var teamRight = {};
teamRight.nameID = "Right";
teamRight.instQueue = [];
teamRight.boxSets = [];
teamRight.position = 0;

var activeTeam = teamLeft;

function preload() {
	game.load.image('box', 'square.png');

	game.load.image('unit', 'images/unit.png');

	game.load.image('arrow-up', 'images/arrow-up.png');
	game.load.image('arrow-down', 'images/arrow-down.png');
	game.load.image('arrow-up-ext', 'images/arrow-up-ext.png');
	game.load.image('arrow-down-ext', 'images/arrow-down-ext.png');

	game.load.image('btn-neg-3', 'images/btn-neg-3.png');
	game.load.image('btn-neg-2', 'images/btn-neg-2.png');
	game.load.image('btn-neg-1', 'images/btn-neg-1.png');
	game.load.image('btn-pos-1', 'images/btn-pos-1.png');
	game.load.image('btn-pos-2', 'images/btn-pos-2.png');
	game.load.image('btn-pos-3', 'images/btn-pos-3.png');

	game.load.image('character', 'images/character.png');
}

function create() {
	game.stage.backgroundColor = 0xffffff;

	if (myTeam == "l") {
		activeTeam = teamLeft;
	} else {
		activeTeam = teamRight;
	}

	createCharacters();

	boardBack = createBoard();
	buttons = createButtons();

	fetchCommands();

	game.time.events.loop(Phaser.Timer.SECOND * 0.1, popQueues, this);
}

var downFlag = false;
var upFlag = false;

function update() {
	var cursors = game.input.keyboard.createCursorKeys();

	
}

function render() {
	renderFeed();
	renderLeft();
	renderRight();
}

function renderFeed() {
	var feedLimit;
	if (activeTeam.boxSets.length > 0) {
		feedLimit = (game.world.height - BOTBAR_HEIGHT) / (activeTeam.boxSets[0][0].height + FEED_BORDER) - 1;
	} else {
		feedLimit = 0;
	}

	for (var i = 0; i < Math.min(activeTeam.instQueue.length, feedLimit); i++) {
		renderInst(activeTeam.instQueue[i], activeTeam.boxSets[i], i);
	}
}

function renderInst(inst, boxes, depth) {
	var newBox;
	for (var i = 1; i <= Math.abs(inst); i++) {
		newBox = boxes[i-1];
		
		var factor;
		if (inst < 0) {
			factor = -1 * (-3 + (-1 * i));
		} else {
			factor = 4 - i;
		}

		newBox.x = game.world.width - ((newBox.width + FEED_BORDER) * factor);
		newBox.y = (depth * (FEED_BORDER + newBox.height)) + FEED_BORDER;
	}
}

function pushLeftQueue(inst) {
	pushQueue(inst, teamLeft);
}

function pushRightQueue(inst) {
	pushQueue(inst, teamRight);
}

function pushQueue(inst, team) {
	team.instQueue.push(inst);
	var boxSet = [];
	var newBox;
	for (var i = 0; i < Math.abs(inst); i++) {
		newBox = game.add.sprite(-100,-100, 'box');
		newBox.scale.setTo(0.2, 0.2);
		boxSet.push(newBox);
	}

	team.boxSets.push(boxSet);
}

function popQueues() {
	popLeftQueue();
	popRightQueue();
}

function popLeftQueue() {
	popQueue(teamLeft);
}

function popRightQueue() {
	popQueue(teamRight);
}

function popQueue(team) {
	// Check if contents exist
	if (team.instQueue.length > 0) {
		// Pop
		var inst = team.instQueue.splice(0, 1);
		var deadSet = team.boxSets.splice(0, 1)[0];
		
		for (var i = 0; i < deadSet.length; i++) {
			deadSet[i].kill();
		}

		// Calc new position
		team.position = calcEndpoint(team.position, inst);
	}
}

// Returns new pos after logic
function calcEndpoint(posit, instruction) {
	// Guarantees non-wrapping movement
	pos = parseInt(posit);
	inst = parseInt(instruction);

	if (inst > 0) {
		if ((pos + inst) % BASE_SIZE < pos % BASE_SIZE) {
			pos = ((Math.floor(pos / BASE_SIZE) + 1) * BASE_SIZE) - 1;
		} else {
			pos += inst;
		}
	} else {
		if (((pos + inst) + (1000 * BASE_SIZE)) % BASE_SIZE > (pos % BASE_SIZE)) {
			pos = (Math.floor(pos / BASE_SIZE)) * BASE_SIZE;
		} else {
			pos += inst;
		}
	}

	// Guarantees landing in-bounds
	if (pos != 0) {
		if ((pos % SINGLE_UP) == 0) {
			if ((pos + BASE_SIZE) < (BASE_SIZE * BOARD_HEIGHT)) {
				pos += BASE_SIZE;
			}
		} else if ((pos % SINGLE_DOWN) == 0) {
			if ((pos - BASE_SIZE) >= 0) {
				pos -= BASE_SIZE;
			}
		} else if ((pos % DOUBLE_UP) == 0) {
			if ((pos + BASE_SIZE + BASE_SIZE) < (BASE_SIZE * BOARD_HEIGHT)) {
				pos += BASE_SIZE + BASE_SIZE;
			}
		} else if ((pos % DOUBLE_DOWN) == 0) {
			if ((pos - (BASE_SIZE + BASE_SIZE)) >= 0) {
				pos -= (BASE_SIZE + BASE_SIZE);
			}
		}
	}

	return pos;
}

function renderLeft() {
	renderTeam(teamLeft);
}

function renderRight() {
	renderTeam(teamRight);
}

function renderTeam(team) {
	var pos = team.position;

	var totalBlockWidth = Math.floor((game.world.width - RIGHTBAR_WIDTH) / BASE_SIZE);
	var blockWidth = totalBlockWidth - BOARD_BORDER;
	var blockHeight = blockWidth;
	var numFloors = Math.floor((game.world.height - BOTBAR_HEIGHT) / blockHeight);

	// Fancy math-like things
	var col = pos % BASE_SIZE;
	var row = Math.floor(pos / BASE_SIZE);

	var posX = (blockWidth / 2) + BOARD_BORDER + ((blockWidth + BOARD_BORDER) * col);
	var posY = (game.world.height - BOTBAR_HEIGHT) - ((blockHeight + BOARD_BORDER) * (row+1)) + BOARD_BORDER;

	team.sprite.x = posX;
	team.sprite.y = posY;
}

function createBoard() {
	// Initialize board
	var index;
	var totalBlockWidth = Math.floor((game.world.width - RIGHTBAR_WIDTH) / BASE_SIZE);
	var blockWidth = totalBlockWidth - BOARD_BORDER;
	var blockHeight = blockWidth;
	var numFloors = Math.floor((game.world.height - BOTBAR_HEIGHT) / (blockHeight + BOARD_BORDER));

	// Constants are dummies
	BOARD_HEIGHT = numFloors;
	console.log(BOARD_HEIGHT);

	var newSprite;
	var newArrow;
	var newX;
	var newY;

	var unitScaleFactor = blockWidth / game.cache.getImage('unit').width;
	var upScaleFactor = blockWidth / game.cache.getImage('arrow-up').width;
	var downScaleFactor = blockWidth / game.cache.getImage('arrow-down').width;
	var doubleUpScaleFactor = blockWidth / game.cache.getImage('arrow-up-ext').width;
	var doubleDownScaleFactor = blockWidth / game.cache.getImage('arrow-down-ext').width;

	var tiles = [];
	var arrows = [];

	// Draw tiles
	for (var row = 0; row <= numFloors; row++) {
		for (var col = 0; col < BASE_SIZE; col++) {
			newArrow = undefined;
			newSprite = undefined;

			newX = ((blockWidth + BOARD_BORDER) * col) + BOARD_BORDER;
			newY = (game.world.height - (((blockHeight + BOARD_BORDER) * row) + BOTBAR_HEIGHT));
			newSprite = game.add.sprite(newX, newY, 'unit');
			newSprite.scale.setTo(unitScaleFactor, unitScaleFactor);

			// Handle arrow creation
			index = col + (row * BASE_SIZE);

			if ((index % SINGLE_UP) == 0) {
				if (((index + BASE_SIZE) < (BASE_SIZE * BOARD_HEIGHT)) && index != 0) {
					newArrow = game.add.sprite(newX, newY-(blockHeight + (BOARD_BORDER / 2)), 'arrow-up');
					// newArrow = game.add.sprite(newX, newY-(BOARD_BORDER / 2), 'arrow-up');
					newArrow.scale.setTo(upScaleFactor, upScaleFactor);
				}
			} else if ((index % SINGLE_DOWN) == 0) {
				if ((index - BASE_SIZE) >= 0) {
					newArrow = game.add.sprite(newX, newY-(blockHeight + (BOARD_BORDER / 2)), 'arrow-down');
					// newArrow = game.add.sprite(newX, newY-(BOARD_BORDER / 2), 'arrow-up');
					newArrow.scale.setTo(downScaleFactor, downScaleFactor);
				}
			} else if ((index % DOUBLE_UP) == 0) {
				if ((index + BASE_SIZE + BASE_SIZE) < (BASE_SIZE * BOARD_HEIGHT)) {
					newArrow = game.add.sprite(newX, newY-((blockHeight + (BOARD_BORDER / 2)) * 2), 'arrow-up-ext');
					// newArrow = game.add.sprite(newX, newY-(BOARD_BORDER / 2), 'arrow-up');
					newArrow.scale.setTo(doubleUpScaleFactor, doubleUpScaleFactor);
				}
			} else if ((index % DOUBLE_DOWN) == 0) {
				if ((index - (BASE_SIZE + BASE_SIZE)) >= 0) {
					newArrow = game.add.sprite(newX, newY-((blockHeight + (BOARD_BORDER / 2)) * 1), 'arrow-down-ext');
					// newArrow = game.add.sprite(newX, newY-(BOARD_BORDER / 2), 'arrow-up');
					newArrow.scale.setTo(doubleDownScaleFactor, doubleDownScaleFactor);
				}
			}

			if (newArrow != undefined) {
				arrows.push(newArrow);
			}

			tiles.push(newSprite);
		}
	}
}

function createButtons() {
	var newButtons = [];
	var newButton;
	var vertOffset = BOTBAR_HEIGHT - 10;

	newButton = game.add.button(game.world.centerX - 332, game.world.height - vertOffset, 'btn-neg-3', pressButton);
	newButton.pressVal = -3;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX - 232, game.world.height - vertOffset, 'btn-neg-2', pressButton);
	newButton.pressVal = -2;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX - 132, game.world.height - vertOffset, 'btn-neg-1', pressButton);
	newButton.pressVal = -1;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX - 68, game.world.height - vertOffset, 'btn-pos-1', pressButton);
	newButton.pressVal = 1;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX - 168, game.world.height - vertOffset, 'btn-pos-2', pressButton);
	newButton.pressVal = 2;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX - 268, game.world.height - vertOffset, 'btn-pos-3', pressButton);
	newButton.pressVal = 3;
	newButtons.push(newButton);
}

function createCharacters() {
	var leftChar = game.add.sprite(-1000, -1000, 'character');
	var rightChar = game.add.sprite(-1000, -1000, 'character');

	var totalBlockWidth = Math.floor((game.world.width - RIGHTBAR_WIDTH) / BASE_SIZE);
	var blockWidth = totalBlockWidth - BOARD_BORDER;
	var blockHeight = blockWidth;
	var numFloors = Math.floor((game.world.height - BOTBAR_HEIGHT) / blockHeight);

	var scaleFactorX = blockWidth / leftChar.width;
	var scaleFactorY = blockHeight / leftChar.height;

	var scaleFactor = Math.min(scaleFactorX, scaleFactorY);

	leftChar.scale.setTo(scaleFactor, scaleFactor);
	rightChar.scale.setTo(scaleFactor, scaleFactor);

	leftChar.anchor.setTo(0.5, 0);
	rightChar.anchor.setTo(0.5, 0);

	teamLeft.sprite = leftChar;
	teamRight.sprite = rightChar;
}

void pressButton(item) {
	pushCommand(item.pressVal);
	console.log(typeof item.pressVal, item.pressVal);
}