const express = require('express');
const app = express();

const routine = require('./routine');

app.use(routine);

// test
routine.task('test #1', function () {
  // works with promises
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
  console.log('Example app listening on port 3000!');
  routine.run();
});