var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStoreSession = require('connect-mongo')(session);
var MongoStoreToken = require('passwordless-mongostore');
var flash = require('connect-flash');
var routes = require('./routes/index');
var expressValidator = require('express-validator');
var passwordless = require('passwordless');
var email = require('emailjs');


var app = express();


/**
 * Connect to MongoDB.
 */

var config;
if (app.get('env') === 'development') {
  config = require('./config/config');
  app.use(logger('dev'));
} else {
  app.use(logger('combined'));
}

var dbURI = process.env.MONGOLAB_URI || config.db;
var emailUsername = process.env.EMAIL_USERNAME || config.emailUsername;
var emailPassword = process.env.EMAIL_PASSWORD || config.emailPassword;
var emailHost = process.env.EMAIL_HOST || config.emailHost;
var hostName = process.env.HOST_NAME || config.hostName;


mongoose.connect(dbURI);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: false,
  store: new MongoStoreSession({
    url: dbURI,
    autoReconnect: true
  }),
  secret: process.env.SESSION_SECRET || config.sessionSecret
}));
app.use(flash());
passwordless.init(new MongoStoreToken(dbURI));
var smtpServer  = email.server.connect({
  user: emailUsername,
  password: emailPassword,
  host: emailHost,
  ssl: true
});
require('./config/passwordless')(passwordless, smtpServer, emailUsername, hostName);
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/dashboard' }));

app.use(function(req, res, next) {
  res.locals.messages = {
    success: req.flash('success').concat(req.flash('passwordless-success')),
    errors:  req.flash('errors').concat(req.flash('passwordless')),
    form_errors: req.flash('form-errors')
  };
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
