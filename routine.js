/**
 * @param {String} description 
 * @param {Function} fn 
 */
function RoutineTask(description, fn) {
  this.description = description;
  this._fn = fn;
}

RoutineTask.prototype.run = function (next) {
  return this._fn(next);
};

function routine(fn) {
  var done = false;

  return function (req, res, next) {
    if (done) {
      next();
    } else {
      fn(req, res, next);
    }
  }
};

routine._tasks = [];

/**
 * Create a new task to run at startup.
 * @param {String} description 
 * @param {Function} fn 
 */
routine.task = function (description, fn) {
  this._tasks.push(new RoutineTask(description, fn));
};

routine.runSerial = function () {
  function runTask(index) {
    var task = routine._tasks[index];
    console.log('*** Running task `' + task.description + '`...');

    var nextCalled = false;
    var taskResult = task.run(function next() {
      nextCalled = true;
      if (index + 1 < routine._tasks.length) {
        runTask(index + 1);
      }
    });

    if (!nextCalled) {
      if (taskResult != null && typeof taskResult.then === 'function') {
        taskResult.then(function () {
          runTask(index + 1);
        });
      }
    }
  }

  if (routine._tasks.length != 0) {
    runTask(0);
  }
};

// test
routine.task('test #1', function () {
  console.log('I am test #1');
  
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, 1000);

  });
});

routine.task('test #2', function (next) {
  console.log('I am test #2');
  next();
});

routine.runSerial();