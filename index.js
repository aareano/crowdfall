//instantiate firebase ref
var ref = new Firebase("https://crowdfall.firebaseio.com");

var userRef;
var auth

var team;

//onAuth watch
ref.onAuth(function(authData) {
	if (authData) {
		console.log("Authenticated with uid:", authData.uid);
		auth = authData;
		userRef = new Firebase("https://crowdfall.firebaseio.com/users/"+authData.uid);
		assignTeam();

	} else {
		console.log("Unauthenticated");
	}
});



function fbAuth() {
	ref.authWithOAuthPopup("facebook", function(error, authData) {
	  if (error) {
	    console.log("Login Failed!", error);
	  } else {
	    console.log("Authenticated successfully with payload:", authData);
	  }
	});
}

//new users will be assigned to a new team randomly
function assignTeam() {
	//check if new user
	var teamRef = userRef.child('team');

	teamRef.on('value', function(snap) {
		if (snap) {
			//not a new user
			team = snap.val();
		} else {

			//randomly assign team
			var roll = Math.random();

			if (roll < 0.5) {
				team = "l"
			} else {
				team = "r"
			}

			//store value on firebase
			teamRef.set(team);
		}
	});
}
