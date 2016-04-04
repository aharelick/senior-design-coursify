var express = require('express');
var router = express.Router();
var validator = require('validator');
var passwordless = require('passwordless');
var User = require('../models/User');
var Review = require('../models/Review');
var CourseList = require('../models/course_list');


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
    return res.redirect('/dashboard');
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

router.get('/course-list', passwordless.restricted({ failureRedirect: '/login'}), function(req, res) {
  res.json(Array.from(CourseList.courses));
});

router.get('/my-reviews', passwordless.restricted({ failureRedirect: '/login'}), function(req, res) {
  Review.find({ user: req.user }, function(err, reviews) {
    if (err) {
      return res.sendStatus(500);
    }
    res.json(reviews);
  });
});

router.post('/submit-review', passwordless.restricted({ failureRedirect: '/login'}), function(req, res) {
  var courseName = req.body['course-name'];
  var rating = req.body.rating;

  if (!validator.isInt(rating, { min: 1, max: 5 })) {
    return res.sendStatus(400);
  }
  if (!CourseList.courses.has(courseName)) {
    return res.sendStatus(400);
  }

  Review.findOne({ user: req.user, courseName: courseName }, function(err, review) {
    if (err) return res.sendStatus(500);
    if (review) {
      review.rating = rating;
      review.save(function (err) {
        if (err) return res.sendStatus(500);
      });
    } else {
      var newReview = Review({
        user: req.user,
        courseName: courseName,
        rating: rating
      });
      newReview.save(function (err) {
        if (err) return res.sendStatus(500);
      });
    }
    return res.sendStatus(200);
  });
});

module.exports = router;
