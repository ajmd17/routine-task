# routine-task

This package allows you to create tasks that run sequentially on every startup of your server.

Routes will not resolve until the start sequence has been completed, and at that point all request will be fulfilled

Example:
```
const express = require('express');
const app = express();

const routine = require('./routine');

// use middleware so requests don't get fulfilled until the startup is complete
app.use(routine);

// set up some testing tasks. this one will resolve in 10 seconds.
routine.task('test #1', function () {
  // works with promises, too!
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, 10000);
  });
});

routine.task('test #2', function (next) {
  next();
});


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  // start the sequence
  routine.run();
});
```