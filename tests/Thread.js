asyncTest("Thread return value", function () {
		var thread = new TL.Thread(function (data) {
			return data * data;
		});

		thread.send(5, function (ret) {
			ok(ret == 25, "Thread's return value successfully passed");
			start();
		});
});

asyncTest("Kill thread", function () {
	var thread = new TL.Thread(function () {
		var sleep = function (ms) { 
			var end = new Date().getTime() + (ms);
			while (new Date().getTime() <= end) {};
		}
		
		sleep(500);
	});
	

	thread.send(null, function () {
		ok(false, "Thread continued although it should be killed");
		start();
		good = true;
	});
	thread.kill();
	
	window.setTimeout(function () {
		ok(true, "Thread killed successfully");
		start();
	}, 750);
});

test("Thread status", function () {
	var thread = new TL.Thread();
	
	ok(thread.getStatus() == TL.ThreadStatus.UNINITIALIZED, "Uninitialized status at beginning");
});

test("Thread status II (Run)", function () {
	var thread = new TL.Thread(function () {
		// do nothing
	});
	
	ok(thread.getStatus() == TL.ThreadStatus.RUNNING, "Running thread");
});

test("Thread status III (manual creating and running)", function () {
	var thread = new TL.Thread();
	thread.setFunction(function () {
		// do nothing
	});
	ok(thread.getStatus() == TL.ThreadStatus.CREATED, "Manually set/created thread function");
	
	thread.run();
	ok(thread.getStatus() == TL.ThreadStatus.RUNNING, "Manually run thread");
});

test("Test exceptions", function () {
	var thread = new TL.Thread();
	var set = function() {
		thread.setFunction(null);
	}
	
	throws(set, TL.ThreadError, "Setting an invalid thread function");
});

asyncTest("Test thread function with variable name other than 'data'", function () {
	var thread = new TL.Thread(function (myData) {
		return myData;
	});
	
	var good = false;
	
	thread.send(5, function (retVal) {
		ok(retVal == 5, "Thread should return the same value");
		start();
		good = true;
	});
	
	window.setTimeout(function () {
		if (!good) {
			ok(false, "Thread did not return");
			start();
		}
	}, 100);
});

asyncTest("Test progress communication", function () {
	var thread = new TL.Thread(function () {
		var i = 0;

		do {
			send(i);
		} while (i++ < 2);

		return i;
	});
	
	var counter = 0;
	var good = false;
	
	thread.send(0,
		function progress(i) {
			ok(counter == i, "Progress data matched");
			counter++;
		},
		function finished(retVal) {
			ok(retVal == counter, "End data matched");
			start();
			good = true;
		}
	);
	
	window.setTimeout(function () {
		if (!good) {
			ok(false, "Thread did not finish");
			start();
		}
	}, 250);
});

asyncTest("Test progress communication without finished event", function () {
	var thread = new TL.Thread(function () {
		var i = 0;

		for (var i=0; i<5; i++) {
			send(i);
		}

		return 23; // Michael Jordan
	});
	
	var counter = 0;
	thread.send(0, function prg(data, finished) {
		if (data == 23) {
			ok(finished == true, "Finished flag");
			start();
		}
		else {
			ok(data == counter, "Counter ok (progress event)");
			counter++;
		}
	});
});

asyncTest("Import local functions", function () {
	var thread = new TL.Thread();
	function square (i) {
		return i*i;
	}
	function square2 (i) {
		return i*i;
	}
	
	thread.setFunction(function (i) {
			return square(i) / square2(i); // always = 1
		},
		[square, square2]
	);

	thread.run();
	thread.send(5, function (retVal) {
		ok(retVal == 1);
		start();
	});
	
	// Catching the thread's exception with try...catch won't work
	// because the exception is thrown asynchronously (@todo btw).
	// Therefore, we use a rather long timeout for the browser.
	window.setTimeout(function () {
		if (thread.status == TL.ThreadStatus.ERROR) {
			ok(false, "Thread threw an error, see browser's JS console");
			start();
		}
	}, 125);
});

asyncTest("Import local anonymous/variable bound functions", function () {
	var thread = new TL.Thread();
	var square = function (i) {
		return i*i;
	};
	thread.setFunction(function (myData) {
		return square(myData) / square2(myData); // always = 1
	}, [{name: "square", func: square}, {name: "square2", func: function (i) {return i*i}}]);
	
	thread.run();
	
	thread.send(5, function (retVal) {
		ok(retVal == 1, "Importing variable bound and anonymous function worked");
		start();
	});
	
	// Catching the thread's exception with try...catch won't work
	// because the exception is thrown asynchronously (@todo btw).
	// Therefore, we use a rather long timeout for the browser.
	window.setTimeout(function () {
		if (thread.status == TL.ThreadStatus.ERROR) {
			ok(false, "Thread threw an error, see browser's JS console");
			start();
		}
	}, 125);
});