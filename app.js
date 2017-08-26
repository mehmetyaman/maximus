/**
 * Module dependencies.
 */
var express = require('express'), expressValidator = require('express-validator');
var i18n = require("i18n");
var app = express();
var env = require('dotenv').load();
var winston = require('winston');

// here after for logging and authentication sss
var mongoose = require('mongoose');
var passport = require('passport');

var email = require("emailjs");
var emailServer = email.server.connect({
    user: "linpretinfo",
    password: "Hede9902",
    host: "smtp.gmail.com",
    ssl: true
});
var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
    'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
});

// send the message and get a callback with an error or details of the message that was sent

// set up our express application
app.use(express.logger('dev')); // log every request to the console
app.use(express.cookieParser()); // read cookies (needed for auth)
app.use(express.bodyParser()); // get information from html forms
app.use(expressValidator());
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(express.session({secret: 'ilovescotchscotchyscotchscotch'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
var flash = require('connect-flash');
app.use(flash()); // use connect-flash for flash messages stored in session

var routes = require('./routes');
var http = require('http');
var path = require('path');
var config = require('config');
var fs = require('fs');
var connection = require('express-myconnection');
var mysql = require('mysql');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// configuration ===============================================================

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(i18n.init);

/*------------------------------------------
 connection peer, register as middleware
 type koneksi : single,pool and request
 -------------------------------------------*/
app.use(
    connection(mysql, config.get('mysql'), 'pool') //or single
);

// here after for logging and authentication eee

//load users route
require('./routes/users');
require('./routes/translators');
require('./routes/login');
// load our routes and pass in our app and fully configured passport
require('./routes/login')(app, passport, winston, emailServer);
require('./routes/videochat');
require('./routes/translators')(app);
require('./routes/translator')(app);
require('./routes/users')(app);
require('./routes/videochat')(app);
require('./routes/payment')(app);
require('./routes/plan')(app, winston, emailServer); // load our routes and pass in our app and fully configured passport
require('./routes/profile-selection')(app);
require('./routes/selection')(app);
require('./routes/sessionComments')(app);
require('./routes/signup')(app, passport, emailServer);

// all environments
app.set('port', process.env.PORT || config.get('app.port'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(expressValidator());

i18n.configure({
    locales:['en', 'de', 'tr'],
    directory: __dirname + '/locales'
});

var errorHandler = express.errorHandler();
app.use(function(err, req, res, next) {
    if (app.get('env') === 'development') {
        return errorHandler(err, req, res, next);
    } else {
        res.send(401);
    }
});
console.log(app.get('env') + '=env  ,,  port=' + app.get('port'));

// here after for logging and authentication

mongoose.connect(config.get('mongo.url')); // connect to our database
require('./config/passport')(passport); // pass passport for configuration

app.use(app.router);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
server.timeout = config.get('app.timeout')/2; // it multiply by 2. i dont understand why. bc of this i divided by 2

var io = require('socket.io').listen(server);
io.on('connection', function(socket) {
    console.log("new connection established");
    socket.emit('announcements', { message: 'A new user has joined!' });
});

