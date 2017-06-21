var http = require('http');

exports.peertest = function(req, res){
    var sessionId = req.params.sessionId;
    console.log(sessionId);
    res.render('peer_test', { title: 'Simultanes Technic CORP', sessionID: sessionId });
};

exports.appear = function(req, res){
    var sessionId = req.params.sessionId;
    var p;
    getPeers(function (p) {
        console.log("pppp"+p);
    });
    res.render('appear2', { title: 'Simultanes Technic CORP', sessionID: sessionId, peers: p});
};



function getPeers(callback) {

    return http.get({
        host: 'localhost',
        port: '9000',
        path: '/peerjs/peers'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            callback({
                peers: parsed
            });
        });
    });

};
