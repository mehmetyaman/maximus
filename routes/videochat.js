var VideoChat = require('../app/models/videochat');
var Peer = require('../app/models/videochatpeer');

module.exports = function (app) {

    /*exports.peertest = function (req, res) {
        var sessionId = req.params.sessionId;
        console.log(sessionId);
        res.render('peer_test', {title: 'YAMANIZM CORP', sessionID: sessionId});
    };*/

    app.get('/videoChat/:id', function (req, res) {
        var sessionId = req.params.id;
        var p;
        getPeers(function (p) {
            console.log("pppp" + p);
        });
        res.render('trans_session/appear2', {title: 'Video Conference', sessionID: sessionId, peers: p});
    });

    app.get('/peers/:videoChatId', function (req, res) {
        var videoChatId = req.params.videoChatId;
        Peer.find({"videoChatId": videoChatId}, function (err, peers) {
            if (err) {
                console.log("Error /peers/:videoChatId : %s ", err);
                res.status(500).send(err);
            } else {
                res.send(peers);
            }
        });
    });

    app.get('/videoChats', function (req, res) {
        VideoChat.find({}, function (err, videoChats) {
            if (err) {
                console.log("Error /videoChats : %s ", err);
                res.status(500).send(err);
            } else {
                res.send(videoChats);
            }
        });
    });

    app.get('/videoChatsPage', function (req, res) {
        VideoChat.find({}, function (err, videoChats) {
            if (err) {
                console.log("Error /videoChatsPage : %s ", err);
                res.status(500).send(err);
            } else {
                videoChats.forEach(function (videoChat) {
                    Peer.find({}, function (err, peers) {
                        if (err) {
                            console.log("Error /videoChatsPage : %s ", err);
                            res.status(500).send(err);
                        }else{
                            videoChat.peers=peers;
                            res.render('trans_session/videoChats', {page_title: 'Active Video Conferences', videoChats: videoChats, user: req.user});
                        }
                    });
                });

            }
        });
    });

    app.get('/videoChat/save/:id',  function (req, res) {
        var id = req.params.id;
        // create the videoChat
        var videoChat    = new VideoChat();
        videoChat._id    = id;
        videoChat.createdAt= new Date();
        videoChat.trans_lang = "Tr > Eng";
        videoChat.save( function (err) {
            if (err) {
                console.log("Error /videoChat/save/:id : %s ", err);
                res.status(500).send(err);
            } else {
                res.send("VideoChat has created!");
            }
        });
    });

    app.get('/videoChat/remove/:id',  function (req, res) {
        var id = req.params.id;
        VideoChat.remove( {"_id":id}, function (err) {
            if (err) {
                console.log("Error /videoChat/remove/:id : %s ", err);
                res.status(500).send(err);
            } else {
                res.send("VideoChat has deleted!");
            }
        });
    });

    app.get('/peer/save/:videoChatId/:peerId',  function (req, res) {
        var videoChatId = req.params.videoChatId;
        var peerId = req.params.peerId;
        var peer    = new Peer();
        peer._id    = peerId;
        peer.videoChatId=videoChatId;
        peer.save(function (err) {
            if (err) {
                console.log("Error /peer/save/:videoChatId/:peerId : %s ", err);
                res.status(500).send(err);
            } else {
                res.send("Peer has attended!");
            }
        });
    });

    function getPeers(videoChatId, callback) {

        return http.get({
            host: 'localhost',
            port: '4300',
            path: '/peers/'+videoChatId
        }, function (response) {
            // Continuously update stream with data
            var body = '';
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {

                // Data reception is done, do whatever with it!
                var parsed = JSON.parse(body);
                callback({
                    peers: parsed
                });
            });
        });

    };

    function getClients(callback) {

        return http.get({
            host: 'localhost',
            port: '9000',
            path: '/peerjs/peers'
        }, function (response) {
            // Continuously update stream with data
            var body = '';
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {

                // Data reception is done, do whatever with it!
                var parsed = JSON.parse(body);
                callback({
                    peers: parsed
                });
            });
        });

    };

}