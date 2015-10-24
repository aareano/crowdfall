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

//fetches commands starting from last block
function getLeftBlocks() {
	leftRef.orderByKey().limitToLast(1).on("child_added", function(snapshot) {
		//first value should be the position key, "0" for the sake of ordering with timeStamp keys
		if (snapshot.key() === "0") {
			//the value is the coord. that left should start simulation
			//	someCoordVal = snapshot.val();
			//	call some relevant functions without call back to complete setup before commands arrive;
		} else {
			//value is a command
			//	someCommandVal = snapshot.val();
			//	call some relevant function to add it to phaser queue
		}
	});
}

//fetches commands starting from last block
function getRightBlocks() {
	rightRef.orderByKey().limitToLast(1).on("child_added", function(snapshot) {
		//first value should be the position key, "0" for the sake of ordering with timeStamp keys
		if (snapshot.key() === "0") {
			//the value is the coord. that left should start simulation
			//	someCoordVal = snapshot.val();
			//	call some relevant functions without call back to complete setup before commands arrive;
		} else {
			//value is a command
			//	someCommandVal = snapshot.val();
			//	call some relevant function to add it to phaser queue
		}
	});
}