
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

//load users route
var users = require('./routes/users');
var translators = require('./routes/translators');
var app = express();

var connection  = require('express-myconnection'); 
var mysql = require('mysql');

// all environments
app.set('port', process.env.PORT || 4300);
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

/*------------------------------------------
    connection peer, register as middleware
    type koneksi : single,pool and request 
-------------------------------------------*/

app.use(
    
    connection(mysql,{
        
        host: 'localhost',
        user: 'root',
        password : '',
        port : 3306, //port mysql
        database:'maxsimus'

    },'pool') //or single

);



app.get('/', routes.index);

app.get('/users', users.list);
app.get('/users/add', users.add);
app.post('/users/add', users.save);
app.get('/users/delete/:id', users.delete_user);
app.get('/users/edit/:id', users.edit);
app.post('/users/edit/:id',users.save_edit);

app.get('/translators', translators.list);
app.get('/translators/add', translators.add);
app.post('/translators/add', translators.save);
app.get('/translators/edit/:id', translators.edit);
app.post('/translators/edit/:id',translators.save_edit);
app.get('/translators/delete/:id', translators.delete_translator);

app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
