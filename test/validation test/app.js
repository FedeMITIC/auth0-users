const express = require('express');
const path = require('path');
const logger = require('morgan');
// const getTokenInfo = require('auth0-retrieve-user');
const getTokenInfo = require('../../index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// const domainURL = 'your_domain_URL';
/* async function getUser(req, res, next) {
  res.locals.user = await getTokenInfo(req.headers.authorization);
  next();
} */

const getUser = (req, res, next) =>
  getTokenInfo(req.headers.authorization)
    .then((user) => {
      res.locals.user = user;
      next();
    })
    .catch((error) => {
      console.log(error);
      res.status(error.statusCode).send(error.message);
    });


/* Routing */
const index = require('./routes/index');
const users = require('./routes/users');

app.use('/', index);
app.use('/users', getUser, users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
