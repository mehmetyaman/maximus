/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var config = require('config');
var fs = require('fs');
var connection = require('express-myconnection');
var mysql = require('mysql');

//load users route
var users = require('./routes/users');
var translators = require('./routes/translators');
var videochat = require('./routes/videochat');

var app = express();

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

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
console.log(app.get('env')+'=env  ,,  port=' + app.get('port'));


/*------------------------------------------
 connection peer, register as middleware
 type koneksi : single,pool and request
 -------------------------------------------*/
var connection = mysql.createConnection(config.get('mysql'));
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE database maxsimus;";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("sql executed");
    });
    var sql2 = fs.readFileSync('translator.sql').toString();
    connection.query(sql2, function (err, result) {
        if (err) throw err;
        console.log("sql2 executed");
    });
    var sql3 = fs.readFileSync('user.sql').toString();
    connection.query(sql3, function (err, result) {
        if (err) throw err;
        console.log("sql3 executed");
    });
});
app.use(connection);

app.get('/', routes.index);

// user mappings here sss
app.get('/users', users.list);
app.get('/users/add', users.add);
app.post('/users/add', users.save);
app.get('/users/delete/:id', users.delete_user);
app.get('/users/edit/:id', users.edit);
app.post('/users/edit/:id', users.save_edit);
// user mappings here eee

// translator mappings here sss
app.get('/translators', translators.list);
app.get('/translators/add', translators.add);
app.post('/translators/add', translators.save);
app.get('/translators/delete/:id', translators.delete_translator);
app.get('/translators/edit/:id', translators.edit);
app.post('/translators/edit/:id', translators.save_edit);
// translator mapping here eee

// videochat mapping start
app.get('/peertest/:sessionId', videochat.peertest);
// videochat mapping end

app.use(app.router);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
