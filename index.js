//instantiate firebase ref
var ref = new Firebase("https://crowdfall.firebaseio.com");

var userRef;
var auth;
var leftRef;
var rightRef;

var myTeam;
var numBlocks;

//onAuth watch
ref.onAuth(function(authData) {
	if (authData) {
		console.log("Authenticated with uid:", authData.uid);
		setVarsOnAuth(authData);
		hideAuthOverlay();
	} else {
		console.log("Unauthenticated");
		showAuthOverlay();
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
	    hideAuthOverlay();
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
			myTeam = snap.val();
		} else {

			//randomly assign team
			var roll = Math.random();

			if (roll < 0.5) {
				myTeam = "l";
			} else {
				myTeam = "r";
			}

			//store value on firebase
			teamRef.set(myTeam);
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
 
// //when last command of a block is fetched, early simulation must happen
// //simulate result of the block commands and report back result
// //set coord on $block/0/
// function earlySimulate() {

// }


//pushes command to relevant team
function pushCommand(instruction) {
	//must first check if 
	//team
	//check
	//ref.push(instruction);
	if (team==="l") {
		leftRef.push(instruction);
	} else {
		rightRef.push(instruction);
	}
}



function fetchCommands() {

	//allow pre-auth access temporarily
	leftRef = ref.child("leftBlocks");
	rightRef = ref.child("rightBlocks");


	leftRef.once("value", function(snapshot) {

		var lastIndex = snapshot.numChildren();

		var key = snapshot.child(lastIndex).key();

		snapshot.forEach(function (childSnapShot) {
			if(childSnapShot.key()!=key){
				pushLeftQueue(childSnapShot.val());
			}
		});


		leftRef.orderByKey().startAt(key).on("child_added", function(callSnapShot) {
			pushLeftQueue(callSnapShot.val());
		});

	});


	rightRef.once("value", function(snapshot) {

		var lastIndex = snapshot.numChildren();

		var key = snapshot.child(lastIndex).key();

		snapshot.forEach(function (childSnapShot) {
			if(childSnapShot.key()!=key){
				pushRightQueue(childSnapShot.val());
			}
		});


		rightRef.orderByKey().startAt(key).on("child_added", function(callSnapShot) {
			pushRightQueue(callSnapShot.val());
		});

	});


}

function hideAuthOverlay() {
	$(document).ready(function(){
		$('#overlay').hide();
	});
}

function showAuthOverlay() {
	$(document).ready(function(){
		$('#overlay').show();
	});
}