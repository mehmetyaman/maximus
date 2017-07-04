var VideoChat = require('../app/models/videochat');
var Peer = require('../app/models/videochatpeer');
var path = require('path');

module.exports = function (app) {

    app.get('/videoConference/:id', isLoggedIn, function (req, res) {
        var videoChatId = req.params.id;
        var peerId = req.user.id;
        var username=req.user.email;
        var videoChat;
        var isRoomCreated=false;
        VideoChat.find({"_id":videoChatId}, function (err, videoChat) {
            if (videoChat.length==0) {
                createVideoChat(videoChatId, function (err) {
                    if (err) {
                        console.log("Error /videoChat/:id : %s ", err);
                        res.status(500).send(err);
                    }else{
                        isRoomCreated=true;
                    }
                });
            }
            Peer.find({"videoChatId": videoChatId, "id": peerId}, function (err, peer) {
                if (peer.length==0) {

                    createPeer(videoChatId, peerId, username, function () {
                        if (err) {
                            console.log("Error /videoChat/:id : %s ", err);
                            res.status(500).send(err);
                        }
                    });
                }else{
                    console.log("Error /videoChat/:id : %s ", err);
                    res.status(500).send("You already have an active session!");
                }
            });

            Peer.find({"videoChatId": videoChatId, "id" : { $nin: [peerId] }}, function (err, peers) {
                if (err) {
                    console.log("Error /videoChat/:id : %s ", err);
                    res.status(500).send(err);
                }
                res.render('trans_session/videoConference', {title: 'Video Conference', roomId:videoChatId, peerId:peerId, peers: peers});
            });
        });
    });

    app.get('/peertest/:sessionId', function (req, res) {
        var sessionId = req.params.sessionId;
        console.log(sessionId);
        res.render('trans_session/peer_test', {title: 'YAMANIZM CORP', sessionID: sessionId});
    });

    app.get('/videoChat/:id', function (req, res) {
        var videoChatId = req.params.id;
        var peerId = req.user.id;
        var username=req.user.email;
        var videoChat;
        VideoChat.find({"_id":videoChatId}, function (err, videoChat) {
            if (videoChat.length==0) {
                createVideoChat(videoChatId, function (err) {
                    if (err) {
                        console.log("Error /videoChat/:id : %s ", err);
                        res.status(500).send(err);
                    }
                });
            }
            Peer.find({"videoChatId": videoChatId, "id": peerId}, function (err, peer) {
                if (peer.length==0) {

                    createPeer(videoChatId, peerId, username, function () {
                        if (err) {
                            console.log("Error /videoChat/:id : %s ", err);
                            res.status(500).send(err);
                        }
                    });
                }else{
                    console.log("Error /videoChat/:id : %s ", err);
                    res.status(500).send("You already have an active session!");
                }
            });

            Peer.find({"videoChatId": videoChatId, "id" : { $nin: [peerId] }}, function (err, peers) {
                if (err) {
                    console.log("Error /videoChat/:id : %s ", err);
                    res.status(500).send(err);
                }
                res.render('trans_session/appear2', {title: 'Video Conference', sessionID: peerId, peers: peers});
            });

        });

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
                    Peer.find({"videoChatId":videoChat._id}, function (err, peers) {
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
        createVideoChat( id, function (err) {
            if (err) {
                console.log("Error /videoChat/save/:id : %s ", err);
                res.status(500).send(err);
            } else {
                res.send("VideoChat has created!");
            }
        });
    });

    function createVideoChat(id, callback) {
        // create the videoChat
        var videoChat = new VideoChat();
        videoChat._id = id;
        videoChat.createdAt = new Date();
        videoChat.trans_lang = "Tr > Eng";
        videoChat.save(function (err) {
            callback(err);
        });
    }

    function createPeer(videoChatId, peerId, username, callback) {
        var peer    = new Peer();
        peer._id    = peerId;
        peer.videoChatId=videoChatId;
        peer.username=username;
        peer.save(function (err) {
            callback(err);
        });
    }

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
        var username=req.user.username;
        createPeer(videoChatId, peerId, username, function () {
            if (err) {
                console.log("Error /peer/save/:videoChatId/:peerId : %s ", err);
                res.status(500).send(err);
            } else {
                res.send("Peer has attended!");
            }
        });
    });

    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }

}
