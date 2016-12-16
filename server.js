var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var csrf = require('csurf');
var expressValidator = require('express-validator');
var flash = require('connect-flash');


var routes = require('./routes/index');
require('./config/passport');
mongoose.connect(process.env.MONGO_URI);

var app = express();

require('dotenv').load();

var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  secret: 'bookRouter',
  resave: false,
  saveUnintialized: false,
  cookie: {secure: false,
  maxAge: 180 * 60 * 1000}
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname + '/public')));


app.use(function(req, res, next){
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});


app.use('/', routes);


app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + 'press Ctrl-C to terminate');
});

module.exports = app;
