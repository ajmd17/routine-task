var joinableCallback = require('joinable-callback');

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

function routine(req, res, next) {
  if (routine.started) {
    if (routine.completed) {
      next();
    } else {
      if (routine.onCompleted == null) {
        routine.onCompleted = joinableCallback(next);
      } else {
        routine.onCompleted.join(next);
      }
    }
  } else {
    throw new Error('Routine not yet started.');
  }
};

routine.onCompleted = null;
routine.started = false;
routine.completed = false;
routine._tasks = [];

/**
 * Create a new task to run at startup.
 * @param {String} description 
 * @param {Function} fn 
 */
routine.task = function (description, fn) {
  this._tasks.push(new RoutineTask(description, fn));
};

routine.run = function () {
  routine.started = true;

  function nextTask(currentIndex) {
    if (currentIndex + 1 < routine._tasks.length) {
      runTask(currentIndex + 1);
    } else {
      routine.completed = true;
      if (routine.onCompleted != null) {
        routine.onCompleted();
      }

      console.log('All tasks completed.');
    }
  }

  function runTask(index) {
    var task = routine._tasks[index];
    console.log('*** ' + task.description);

    // has the 'next' function been called? (if not, check if it is a Promise)
    var nextCalled = false;
    var taskResult = task.run(function next() {
      nextCalled = true;
      nextTask(index);
    });

    if (!nextCalled) {
      // thenables
      if (taskResult != null && typeof taskResult.then === 'function') {
        taskResult.then(function () {
          nextTask(index);
        });
      }
    }
  }

  if (routine._tasks.length != 0) {
    runTask(0);
  } else {
    if (routine.onCompleted != null) {
      routine.onCompleted();
    }

    console.log('No tasks to run.');
  }
};

if (typeof module === 'object') {
  module.exports = routine;
}