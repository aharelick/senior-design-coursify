var express = require('express');
var router = express.Router();
var validator = require('validator');
var passwordless = require('passwordless');
var User = require('../models/User');


/* GET index page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  if (req.user) {
    res.redirect('/dashboard');
  }
  res.render('login', { title: 'Coursify'});
});

/* POST login details. */
router.post('/send-token',
  function(req, res, next) {
    var email = req.body.email;
    if (!validator.isEmail(email)) {
      req.flash('form-errors', 'Please enter a valid UPenn email address');
      return res.redirect('/login');
    }
    if (!email.endsWith('upenn.edu')) {
      req.flash('form-errors', 'You must use a UPenn email address');
      return res.redirect('/login');
    }
    next();
  },
  passwordless.requestToken(
    // Turn the email address into an user's ID
    function(email, delivery, callback, req) {
      User.findOne({ email: email.toLowerCase() }, function (err, user) {
        if (user) {
          callback(null, user.id)
        } else {
          var newUser = new User({
            email: req.body.email
          });
          newUser.save(function(err) {
            if (err) return callback(err, null);
            callback(null, newUser.id);
          });
        }
      })
    },
    {
      userField: 'email',
      failureRedirect: '/login',
      failureFlash: 'There was a problem with your email, please re-submit it',
      successFlash: 'The link to access the site has been sent to your email'
    }
  ),
  function(req, res) {
    res.redirect('/login');
  }
);

/* GET dashboard. */
router.get('/dashboard', passwordless.restricted({ failureRedirect: '/login'}), function(req, res, next) {
  res.render('dashboard', { title: 'Coursify'});
});

router.get('/logout', passwordless.logout(), function(req, res) {
  res.redirect('/login');
});

module.exports = router;
