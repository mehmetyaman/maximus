module.exports = function (server) {

// Loading socket.io
    var io = require('socket.io').listen(server);

// When a client connects, we note it in the console
    io.sockets.on('connection', function (socket) {
        console.log('A client is connected!');
    });

}
