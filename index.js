//instantiate firebase ref
var ref = new Firebase("https://crowdfall.firebaseio.com");

var userRef;
var auth;
var leftRef;
var rightRef;

//default for nonAuth spectating
var myTeam = "lol";


var numBlocks;
	
//onAuth watch
ref.onAuth(function(authData) {
	if (authData) {
		setVarsOnAuth(authData);
		hideAuthOverlay();
	} else {
		showAuthOverlay();
	}
});

function setVarsOnAuth(authData) {
	auth = authData;
	userRef = new Firebase("https://crowdfall.firebaseio.com/users/"+auth.uid);
	assignTeam();
	leftRef = ref.child("leftBlocks");
	rightRef = ref.child("rightBlocks");
}

function fbAuth() {
	ref.authWithOAuthPopup("facebook", function(error, authData) {
	  if (error) {
	    setVarsOnAuth(authData);
	    hideAuthOverlay();
	  } else {
	  }
	});
}

//new users will be assigned to a new team randomly
function assignTeam() {
	//check if new user
	var teamRef = new Firebase("https://crowdfall.firebaseio.com/users/"+auth.uid+"/team");
	teamRef.on("value", function(snap) {
		if (snap.val()) {
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
		$(document).ready(function(){
			if (myTeam.localeCompare("l")===0) {
				$("#teamP").text(" Blue");
			} else {
				$("#teamP").text(" Red");
			}
		});
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
	if (myTeam === "l") {
		leftRef.push(instruction);
	} else if (myTeam === "r") {
		rightRef.push(instruction);
	} else {
		// bad
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
		$("#overlay").hide();
		$("#teamBanner").show();
	});

}

function showAuthOverlay() {
	$(document).ready(function(){
		$("#overlay").show();
		$("#teamBanner").hide();
	});

}

function purge() {
	leftRef.set(null);
	rightRef.set(null);
}