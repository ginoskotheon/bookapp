var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var objectId = new mongoose.Schema.ObjectId;
var bodyParser = require('body-parser');
var User = require('../models/user');
var Books = require('../models/books');
var request = require('request');
var passport = require('passport');
var csrf = require('csurf');
var bcrypt = require('bcryptjs');
var session = require('express-session');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(csrf());
function csrf(req, res, next) {
  res.locals._csrf = req.session._csrf;
  next();
}

router.get('/home', isLoggedIn, function(req, res, next){
  var newBookshelf = {
    admin: 'William McDonald',
    library: []
  }
  var Bookshelf = new Books(newBookshelf);
  Bookshelf.save();
  var bookshelf = req.user.books;
  var trades = req.user.trades.traderequests.length;
  var mytrades = req.user.trades.mytrades.length;
  // console.log(trades);
  res.render('home',{data2: bookshelf, trades: trades, mytrades: mytrades, csrfToken: req.csrfToken()});
});

router.get('/profile', isLoggedIn, function(req,res,next){
  var data = req.user;
  var email = req.user.email;
  // console.log(email);
  res.render('profile', {user: req.user, data: data});
});

router.get('/updateprofile', isLoggedIn, function(req,res,next){
  // console.log(req.user._id);
  res.render('updateprofile', {csrfToken: req.csrfToken()});
});

router.post('/updated', isLoggedIn, function(req,res,next){
  var objForUpdate = {};
  if(req.body.firstname) objForUpdate.firstname = req.body.firstname;
  if(req.body.lastname) objForUpdate.lastname = req.body.lastname;
  if(req.body.city) objForUpdate.city = req.body.city;
  if(req.body.state) objForUpdate.state = req.body.state;
  var setObj = { $set: objForUpdate }

  User.update({_id: req.user._id}, setObj).then(function(data){
    // console.log(data);
  });
  res.redirect('/home');
});

router.get('/allbooks', isLoggedIn, function(req, res,next){
  var csrf = req.csrfToken();
  Books.findOne({admin: 'William McDonald'}).then(function(data){
    // console.log(data.library);
    var bookshelf = data.library;

    // console.log(bookshelf);
    res.render('allbooks', {data: bookshelf, csrfToken: req.csrfToken()});
  });
});

router.post('/allbooks', isLoggedIn, function(req,res,next){
  var bookshelf = [];
  var firstname = req.user.firstname;
  var lastname = req.user.lastname;
  var id = req.user._id;
  var csrf = req.body._csrf;
  var url = req.body.url;
  // console.log(url);
  request(url, function(err, resp, body){
     var data = JSON.parse(body);
    //  console.log(data);
    var title = data.volumeInfo.title;
    var author = data.volumeInfo.authors[0];
    var thumb = data.volumeInfo.imageLinks.smallThumbnail;
    // console.log(thumb);
    var thumbray = thumb.split("");
    // console.log(thumbray);
    var thumbsplice = thumbray.splice(4, 0,"s");
    // console.log(thumbray);
    var thumbsecure = thumbray.join('');
    console.log(thumbsecure);
    var obj = {
      title: title,
      author: author,
      thumb: thumbsecure
    }
    var obj2 = {
      user: id,
      firstname: firstname,
      lastname: lastname,
      title: title,
      author: author,
      thumb: thumbsecure
    }
    var pushed = {$addToSet: {books: obj}};
    var pushed2 = {$addToSet: {library: obj2}};
    User.update({_id: req.user._id},pushed).then(function(data){
      // console.log(data);
    });
    Books.update(pushed2).then(function(data){
      // console.log(data);
    });
  });
  res.redirect('/allbooks');
});

router.post('/trading', isLoggedIn, function(req, res, next){

  var id = req.body.identified;
  var msg = req.body.comment;
  var first = req.body.first;
  var last = req.body.last;
  var fromfirst = req.user.firstname;
  var fromlast = req.user.lastname;
  var title = req.body.book;
  var img = req.body.thumbness;
  var subject = req.body.subject;
  var user = req.user._id;
  var email = req.user.email;

  // console.log(id, user);
  var trading = {
    firstname: fromfirst,
    lastname: fromlast,
    email: email,
    subject: subject,
    msg: msg,
    thumb: img
  }
  console.log(trading);

  User.update({_id: id}, {$push: { 'trades.traderequests': trading}}).then(function(data){
    // console.log(data);
  });

  var mytrade = {
    firstname: first,
    lastname: last,
    subject: subject,
    msg: msg,
    thumb: img
  }
  console.log(mytrade);
    User.update({_id: user}, {$push: { 'trades.mytrades': mytrade}}).then(function(data){
      // console.log(data);
    });
  res.redirect(301, '/home');
});

router.get('/traderequests', isLoggedIn, function(req,res,next){

  User.findOne({_id: req.user._id}).then(function(data){
    // console.log(data);
    var traderequests = data.trades.traderequests;
    // console.log(traderequests);
    res.render('traderequests', {data: traderequests,csrfToken: req.csrfToken()});
  });
});

router.get('/mytrades', isLoggedIn, function(req,res,next){

  User.findOne({_id: req.user._id}).then(function(data){
    // console.log(JSON.stringify(data));
    var traderequests = data.trades.mytrades;
    // console.log(traderequests);
    res.render('mytrades', {data: traderequests, csrfToken: req.csrfToken()});
  });
});

router.get('/mybooks', isLoggedIn, function(req,res,next){
  var bookshelf = req.user.books;
  // console.log(bookshelf);
  res.render('mybooks', {data: bookshelf, csrfToken: req.csrfToken()});
});

router.get('/thankyou', isLoggedIn, function(req, res, next){

  res.render('thankyou');
});

router.post('/mytrader', isLoggedIn, function(req,res){
  var item = req.body.item;
  var id = req.user._id

  User.update({_id: id }, {$pull: {"trades.mytrades": {thumb: item}}}).then(function(err,data){
    if (err) throw err;
    // console.log(JSON.stringify(data));

  });
  res.redirect('back');
});

router.post('/myrequested', isLoggedIn, function(req,res){
  var item = req.body.item;
  var id = req.user._id
  // console.log(item);
  // console.log(id);

  User.update({_id: id }, {$pull: {"trades.traderequests": {thumb: item}}}).then(function(err,data){
    if (err) throw err;
    // console.log(JSON.stringify(data));

  });
  res.redirect('back');
});

router.post('/mine', isLoggedIn, function(req,res){
  var item = req.body.item;
  var id = req.user._id
  // console.log(item);
  // console.log(id);

  User.update({_id: id }, {$pull: {"books": {thumb: item}}}).then(function(err,data){
    if (err) throw err;
    // console.log(JSON.stringify(data));

  });
  Books.update({admin: 'William McDonald'}, {$pull: {"library": {thumb: item}}}).then(function(err,data){});
  res.redirect('back');
});

router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout();
  res.redirect('/');
});
router.get('/', notLoggedIn, function(req, res, next){
  res.render('index', {layout: 'pre'});
});

router.get('/register', function(req, res){
  var messages = req.flash('error');
  res.render('register', { title: 'register', layout: 'pre', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/register', passport.authenticate('local.signup', {
  successRedirect: '/home',
  failureRedirect: '/register',
  failureFlash: true
}));

router.get('/login', function(req, res){
  var messages = req.flash('error');
  res.render('login', {layout: 'pre', csrfToken: req.csrfToken(), title: 'login', messages: messages, hasErrors: messages.length > 0 });

});

router.post('/login', passport.authenticate('local.signin', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

module.exports = router;

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
  res.redirect('/');
}

function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
  return next();
  }
  res.redirect('/');
}
