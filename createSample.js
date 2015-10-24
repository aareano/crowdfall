function createSample() {

	var leftRef = ref.child("leftBlocks");
	var rightRef = ref.child("rightBlocks");

	for (var i=0; i < 500; i++) {
		var roll = Math.random();

		if (roll < 0.16666666) {
			leftRef.push(-3);
		} else if (roll < 0.3333333333) {
			leftRef.push(-2);
		} else if (roll < 0.5) {
			leftRef.push(-1);
		} else if (roll < 0.6666666666) {
			leftRef.push(1);
		} else if (roll < 0.833333333333) {
			leftRef.push(2);
		} else {
			leftRef.push(3);
		}
	}


	for (var j=0; j < 500; j++) {
		var roll = Math.random();

		if (roll < 0.16666666) {
			rightRef.push(-3);
		} else if (roll < 0.3333333333) {
			rightRef.push(-2);
		} else if (roll < 0.5) {
			rightRef.push(-1);
		} else if (roll < 0.6666666666) {
			rightRef.push(1);
		} else if (roll < 0.833333333333) {
			rightRef.push(2);
		} else {
			rightRef.push(3);
		}
	}
}