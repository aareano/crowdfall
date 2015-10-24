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
var LEFTBAR_WIDTH = 250;

var SCREEN_WIDTH = 1000;
var SCREEN_HEIGHT = 600;

var buttons;
var boardBack;

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, 'phaser-wrapper', {
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
	game.load.image('boxRight', 'square.png');
	game.load.image('boxLeft', 'bSquare.png');

	game.load.image('unit', 'images/unit.png');

	game.load.image('arrow-up', 'images/arrow-up.png');
	game.load.image('arrow-down', 'images/arrow-down.png');
	game.load.image('arrow-up-ext', 'images/arrow-up-ext.png');
	game.load.image('arrow-down-ext', 'images/arrow-down-ext.png');

	game.load.spritesheet('btn-neg-3', 'buttons/l3.png', 64, 64);
	game.load.spritesheet('btn-neg-2', 'buttons/l2.png', 64, 64);
	game.load.spritesheet('btn-neg-1', 'buttons/l1.png', 64, 64);
	game.load.spritesheet('btn-pos-1', 'buttons/r1.png', 64, 64);
	game.load.spritesheet('btn-pos-2', 'buttons/r2.png', 64, 64);
	game.load.spritesheet('btn-pos-3', 'buttons/r3.png', 64, 64);

	game.load.image('red_circle', 'images/red_circle.png');
	game.load.image('blue_circle', 'images/blue_circle.png');

	game.load.image('polyhack', 'images/polyhack.png');
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
	renderLeftFeed();
	renderRightFeed();
	renderLeft();
	renderRight();
}

function renderLeftFeed() {
	var feedLimit;
	if (teamLeft.boxSets.length > 0) {
		feedLimit = (game.world.height - BOTBAR_HEIGHT) / (teamLeft.boxSets[0][0].height + FEED_BORDER) - 1;
	} else {
		feedLimit = 0;
	}

	for (var i = 0; i < Math.min(teamLeft.instQueue.length, feedLimit); i++) {
		renderLeftInst(teamLeft.instQueue[i], teamLeft.boxSets[i], i);
	}
}

function renderRightFeed() {
	var feedLimit;
	if (teamRight.boxSets.length > 0) {
		feedLimit = (game.world.height - BOTBAR_HEIGHT) / (teamRight.boxSets[0][0].height + FEED_BORDER) - 1;
	} else {
		feedLimit = 0;
	}

	for (var i = 0; i < Math.min(teamRight.instQueue.length, feedLimit); i++) {
		renderRightInst(teamRight.instQueue[i], teamRight.boxSets[i], i);
	}
}

function renderRightInst(inst, boxes, depth) {
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

function renderLeftInst(inst, boxes, depth) {
	var newBox;
	for (var i = 1; i <= Math.abs(inst); i++) {
		newBox = boxes[i-1];

		var factor;
		if (inst < 0) {
			factor = -1 * (-3 + (-1 * i));
		} else {
			factor = 4 - i;
		}

		newBox.x = ((newBox.width + FEED_BORDER) * 6) - ((newBox.width + FEED_BORDER) * factor) + FEED_BORDER;
		newBox.y = (depth * (FEED_BORDER + newBox.height)) + FEED_BORDER;
	}
}

function pushLeftQueue(inst) {
	pushQueue(inst, teamLeft, 'boxLeft');
}

function pushRightQueue(inst) {
	pushQueue(inst, teamRight, 'boxRight');
}

function pushQueue(inst, team, imgKey) {
	team.instQueue.push(inst);
	var boxSet = [];
	var newBox;
	for (var i = 0; i < Math.abs(inst); i++) {
		newBox = game.add.sprite(-100,-100, imgKey);
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
			if ((pos + BASE_SIZE) < (BASE_SIZE * (BOARD_HEIGHT + 1))) {
				pos += BASE_SIZE;
			}
		} else if ((pos % SINGLE_DOWN) == 0) {
			if ((pos - BASE_SIZE) >= 0) {
				pos -= BASE_SIZE;
			}
		} else if ((pos % DOUBLE_UP) == 0) {
			if ((pos + BASE_SIZE + BASE_SIZE) < (BASE_SIZE * (BOARD_HEIGHT + 1))) {
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

	if (pos == (BASE_SIZE * (BOARD_HEIGHT + 1)) - 1) {
		console.log('win');
		teamLeft.position = 0;
		teamRight.position = 0;
	}

	var totalBlockWidth = Math.floor((game.world.width - RIGHTBAR_WIDTH - LEFTBAR_WIDTH) / BASE_SIZE);
	var blockWidth = totalBlockWidth - BOARD_BORDER;
	var blockHeight = blockWidth;
	var numFloors = Math.floor((game.world.height - BOTBAR_HEIGHT) / blockHeight);

	// Fancy math-like things
	var col = pos % BASE_SIZE;
	var row = Math.floor(pos / BASE_SIZE);

	var posX = LEFTBAR_WIDTH + (blockWidth / 2) + BOARD_BORDER + ((blockWidth + BOARD_BORDER) * col);
	var posY = (game.world.height - BOTBAR_HEIGHT) - ((blockHeight + BOARD_BORDER) * (row+1)) + BOARD_BORDER;

	team.sprite.x = posX;
	team.sprite.y = posY;
}

function createBoard() {
	// Initialize board
	var index;
	var totalBlockWidth = Math.floor((game.world.width - RIGHTBAR_WIDTH - LEFTBAR_WIDTH) / BASE_SIZE);
	var blockWidth = totalBlockWidth - BOARD_BORDER;
	var blockHeight = blockWidth;
	var numFloors = Math.floor((game.world.height - BOTBAR_HEIGHT) / (blockHeight + BOARD_BORDER)) - 1;

	// Constants are dummies
	BOARD_HEIGHT = numFloors;

	var newSprite;
	var newArrow;
	var newX;
	var newY;

	var unitScaleFactor = blockWidth / game.cache.getImage('unit').width;
	var upScaleFactor = blockWidth / game.cache.getImage('arrow-up').width;
	var downScaleFactor = blockWidth / game.cache.getImage('arrow-down').width;
	var doubleUpScaleFactor = blockWidth / game.cache.getImage('arrow-up-ext').width;
	var doubleDownScaleFactor = blockWidth / game.cache.getImage('arrow-down-ext').width;
	var goalScaleFactor = blockWidth / game.cache.getImage('polyhack').width;

	var tiles = [];
	var arrows = [];

	// Draw tiles
	for (var row = 0; row <= numFloors; row++) {
		for (var col = 0; col < BASE_SIZE; col++) {
			newArrow = undefined;
			newSprite = undefined;

			newX = LEFTBAR_WIDTH + ((blockWidth + BOARD_BORDER) * col) + BOARD_BORDER;
			newY = (game.world.height - (((blockHeight + BOARD_BORDER) * row) + BOTBAR_HEIGHT));
			newSprite = game.add.sprite(newX, newY, 'unit');
			newSprite.scale.setTo(unitScaleFactor, unitScaleFactor);

			// Handle arrow creation
			index = col + (row * BASE_SIZE);

			if ((index % SINGLE_UP) == 0) {
				if (((index + BASE_SIZE) < (BASE_SIZE * (BOARD_HEIGHT + 1))) && index != 0) {
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
				if ((index + BASE_SIZE + BASE_SIZE) < (BASE_SIZE * (BOARD_HEIGHT + 1))) {
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

			// add polyhack
			if (row == numFloors - 1 && col == BASE_SIZE - 1) {
				newSprite = game.add.sprite(newX, newY - ((blockHeight * 2 + 10) + (BOARD_BORDER / 2)), 'polyhack');
				newSprite.scale.setTo(goalScaleFactor, goalScaleFactor);
			}
		}
	}
}

function createButtons() {
	var newButtons = [];
	var newButton;
	var vertOffset = BOTBAR_HEIGHT - 10;
	// var buttonWidth = 64 + 20
	var buttonWidth = 64;

	newButton = game.add.button(game.world.centerX - (buttonWidth + (buttonWidth * 2.75)), game.world.height - vertOffset, 'btn-neg-3', pressButton, 0, 1, 0, 2);
	newButton.pressVal = -3;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX - (buttonWidth + (buttonWidth * 1.75)), game.world.height - vertOffset, 'btn-neg-2', pressButton, 0, 1, 0, 2);
	newButton.pressVal = -2;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX - (buttonWidth + (buttonWidth * 0.75)), game.world.height - vertOffset, 'btn-neg-1', pressButton, 0, 1, 0, 2);
	newButton.pressVal = -1;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX + (buttonWidth + (buttonWidth * 0.75)), game.world.height - vertOffset, 'btn-pos-1', pressButton, 0, 1, 0, 2);
	newButton.pressVal = 1;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX + (buttonWidth + (buttonWidth * 1.75)), game.world.height - vertOffset, 'btn-pos-2', pressButton, 0, 1, 0, 2);
	newButton.pressVal = 2;
	newButtons.push(newButton);

	newButton = game.add.button(game.world.centerX + (buttonWidth + (buttonWidth * 2.75)), game.world.height - vertOffset, 'btn-pos-3', pressButton, 0, 1, 0, 2);
	newButton.pressVal = 3;
	newButtons.push(newButton);
}

function createCharacters() {
	var leftChar = game.add.sprite(-1000, -1000, 'blue_circle');
	var rightChar = game.add.sprite(-1000, -1000, 'red_circle');

	var totalBlockWidth = Math.floor((game.world.width - RIGHTBAR_WIDTH - LEFTBAR_WIDTH) / BASE_SIZE);
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

function pressButton(item) {
	pushCommand(item.pressVal);
}