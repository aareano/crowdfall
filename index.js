//instantiate firebase ref
var ref = new Firebase("https://crowdfall.firebaseio.com");

var userRef;
var auth;
var leftRef;
var rightRef;

var team;
var numBlocks;

//onAuth watch
ref.onAuth(function(authData) {
	if (authData) {
		console.log("Authenticated with uid:", authData.uid);
		setVarsOnAuth(authData);
	} else {
		console.log("Unauthenticated");
	}
});

function setVarsOnAuth(authData) {
	auth = authData;
	userRef = new Firebase("https://crowdfall.firebaseio.com/users/"+authData.uid);
	assignTeam();
	leftRef = ref.child("leftBlocks");
	rightRef = ref.child("rightBlocks");
}

function fbAuth() {
	ref.authWithOAuthPopup("facebook", function(error, authData) {
	  if (error) {
	    console.log("Login Failed!", error);
	    setVarsOnAuth(authData);
	  } else {
	    console.log("Authenticated successfully with payload:", authData);
	  }
	});
}

//new users will be assigned to a new team randomly
function assignTeam() {
	//check if new user
	var teamRef = userRef.child("team");

	teamRef.on("value", function(snap) {
		if (snap) {
			//not a new user
			team = snap.val();
		} else {

			//randomly assign team
			var roll = Math.random();

			if (roll < 0.5) {
				team = "l";
			} else {
				team = "r";
			}

			//store value on firebase
			teamRef.set(team);
		}
	});
}



//block chain has been deprecated 

// //fetches commands starting from last block
// function getLeftBlocks() {

// //start at, not limit

// 	// leftRef.orderByKey().limitToLast(1).on("child_added", function(snapshot) {
// 	// 	//first value should be the position key, "0" for the sake of ordering with timeStamp keys
// 	// 	if (snapshot.key() === "0") {
// 	// 		//the value is the coord. that left should start simulation
// 	// 		//	someCoordVal = snapshot.val();
// 	// 		//	call some relevant functions without call back to complete setup before commands arrive;
// 	// 	} else {
// 	// 		//value is a command
// 	// 		//	someCommandVal = snapshot.val();
// 	// 		//	call some relevant function to add it to phaser queue

// 	// 		//commands: -3, -2, -1, 1, 2, 3
// 	// 	}
// 	// });


// }

// //fetches commands starting from last block
// function getRightBlocks() {
// 	rightRef.orderByKey().limitToLast(1).on("child_added", function(snapshot) {
// 		//first value should be the position key, "0" for the sake of ordering with timeStamp keys
// 		if (snapshot.key() === "0") {
// 			//the value is the coord. that left should start simulation
// 			//	someCoordVal = snapshot.val();
// 			//	call some relevant functions without call back to complete setup before commands arrive;
// 		} else {
// 			//value is a command
// 			//	someCommandVal = snapshot.val();
// 			//	call some relevant function to add it to phaser queue
// 		}
// 	});
// }
 
//pushes command to relevant team
function pushCommand() {
	//must first check if 
}


//when last command of a block is fetched, early simulation must happen
//simulate result of the block commands and report back result
//set coord on $block/0/
function earlySimulate() {

}

function fetchCommands() {

	//allow pre-auth access temporarily
	leftRef = ref.child("leftBlocks");
	rightRef = ref.child("rightBlocks");

		//


	leftRef.once("value", function(snapshot) {

		var lastIndex = snapshot.numChildren();

		snapshot.forEach(function (childSnapShot) {
			pushLeftQueue(childSnapShot.val());
		});

		var key = snapshot.child(lastIndex).key();

		leftRef.orderByKey().startAt(key).on("child_added", function(callSnapShot) {
			pushLeftQueue(callSnapShot.val());
		});

	});


	rightRef.once("value", function(snapshot) {

		var lastIndex = snapshot.numChildren();

		snapshot.forEach(function (childSnapShot) {
			pushrightQueue(childSnapShot.val());
		});

		var key = snapshot.child(lastIndex).key();

		rightRef.orderByKey().startAt(key).on("child_added", function(callSnapShot) {
			pushrightQueue(callSnapShot.val());
		});

	});

}