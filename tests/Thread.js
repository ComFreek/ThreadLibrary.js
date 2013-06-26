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