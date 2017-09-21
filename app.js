/**
 * Module dependencies.
 */
var express = require('express')
var i18n = require('i18n')
var app = express()
var winston = require('winston')
var passport = require('passport')
var path = require('path')
var config = require('config')
var session = require('express-session')
var paypal = require('paypal-rest-sdk')
var emailSrv = require('emailjs')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var mysql = require('mysql')
var helmet = require('helmet')
var flash = require('connect-flash')

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
}

var emailServer = emailSrv.server.connect(config.get('email_server'))

var logger = require('./app/utils/logger')
logger.debug('Overriding \'Express\' logger')
app.use(morgan('dev', {'stream': logger.stream}))

paypal.configure(config.get('paypal'))

// set up our express application-

// app.use(require('cookie-parser')) // read cookies (needed for auth)
app.use(session(config.get('session_config')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs') // set up ejs for templating

// Setting parse urlencoded request bodies into req.body.
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('method-override')())
app.use(require('express-validator')())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')))
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')))
// required for passport
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use connect-flash for flash messages stored in session
app.use(i18n.init)
app.set('port', config.get('app.port'))

app.use(helmet())

i18n.configure({
  locales: ['en', 'de', 'tr'],
  directory: path.join(__dirname, '/locales')
})

logger.info('env=' + app.get('env'))

if (app.get('env') === 'development') {
  app.enable('verbose errors')
} else {
  app.disable('verbose errors')
}

/* connection peer, register as middleware
 type koneksi : single,pool and request
 */
var myconnection = require('express-myconnection')
app.use(
  myconnection(mysql, config.get('mysql'), 'pool') // or single
)
// require('mongoose').connect(config.get('mongo.url')) // connect to our database
//
// authentication check. all requests are
var noAuthenticationNeededPaths = [
  '/',
  '/login',
  '/auth/linkedin',
  '/auth/linkedin/callback',
  '/signup',
  '/signupt']
app.get(function (req, res, next) {
  if (noAuthenticationNeededPaths.includes(req.path) ||
    req.isAuthenticated()) {
    return next()
  } else {
    logger.info(
      'unauthorized request, forwarded to /login.. req.path = ' + req.path)
    res.redirect('/login')
  }
})

// load our routes and pass in our app and fully configured passport
require('./routes/login')(app, passport, winston, emailServer)
require('./routes/rest/videochat')(app)
require('./routes/rest/translator')(app)
require('./routes/translator')(app)
require('./routes/users')(app)
require('./routes/videochat')(app)
require('./routes/payment')(app)
require('./routes/plan')(app, winston, emailServer) // load our routes and pass in our app and fully configured passport
require('./routes/profile-selection')(app)
require('./routes/selection')(app)
require('./routes/sessionComments')(app)
require('./routes/signup')(app, passport, emailServer)
require('./config/passport')(passport) // pass passport for configuration

app.use(function (req, res, next) {
  res.status(404)
  res.format({
    html: function () {
      res.render('error/404', {url: req.url})
    },
    json: function () {
      res.json({error: 'Not found'})
    },
    default: function () {
      res.type('txt').send('Not found')
    }
  })
})

app.use(function (err, req, res, next) {
  logger.error(err.stack)
  res.status(err.status || 500)
  if (!err.type) { // if did not set any operational error type
    err.type = 'system_error'
  }
  res.render('error/500', {error: err})
})

process.on('uncaughtException', function (err) {
  logger.error('uncaughtException = ' + err.stack)
})

var server = app.listen(process.env.PORT || app.get('port'), function () {
  logger.info('Listening on ' + app.get('port'))
})
server.timeout = config.get('app.timeout') / 2 // it multiply by 2. i dont understand why. bc of this i divided by 2

var io = require('socket.io').listen(server)
io.on('connection', function (socket) {
  console.log('new connection established')
  socket.emit('announcements', {message: 'A new user has joined!'})
})
