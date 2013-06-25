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