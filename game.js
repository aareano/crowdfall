var BASE_SIZE = 15;
var BOARD_HEIGHT = 50;

var SINGLE_UP = 9;
var SINGLE_DOWN = 13;
var DOUBLE_UP = 53;
var DOUBLE_DOWN = 59;

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
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

var border = 10;

function preload() {
	game.load.image('box', 'square.png');
}

function create() {
	game.stage.backgroundColor = 0x000000;

	// pushLeftQueue(-3);
	// pushLeftQueue(2);
	// pushLeftQueue(-3);
	// pushLeftQueue(-1);
	// pushLeftQueue(3);

	// pushRightQueue(3);
	// pushRightQueue(-1);
	// pushRightQueue(2);
	// pushRightQueue(2);
	// pushRightQueue(-1);
}

var downFlag = false;
var upFlag = false;

function update() {
	var cursors = game.input.keyboard.createCursorKeys();

	if (cursors.up.isDown) {
		if (! upFlag) {
			popLeftQueue();
			popRightQueue();
			upFlag = true;
		}
	} else {
		upFlag = false;
	}
}

function render() {
	game.stage.backgroundColor = 0x000000;

	renderFeed();
}

function renderFeed() {
	var feedLimit;
	if (activeTeam.boxSets.length > 0) {
		feedLimit = game.world.height / (activeTeam.boxSets[0][0].height + border);
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

		newBox.x = game.world.width - ((newBox.width + border) * factor);
		newBox.y = (depth * (border + newBox.height)) + border;
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
		console.log(team.nameID, team.position);
	}
}

// Returns new pos after logic
function calcEndpoint(posit, instruction) {
	// Guarantees non-wrapping movement
	pos = parseInt(posit);
	inst = parseInt(instruction);

	if (inst > 0) {
		if ((pos + inst) % BASE_SIZE < pos % BASE_SIZE) {
			pos = (Math.floor(pos / BASE_SIZE) + 1) * BASE_SIZE;
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
			console.log(pos, SINGLE_UP, (pos % SINGLE_UP));
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