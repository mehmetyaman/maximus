var VideoChat = require('../app/models/videochat')
var Peer = require('../app/models/videochatpeer')
var config = require('config')

module.exports = function (app) {
  app.get('/videoConference/:id', function (req, res) {
    var videoChatId = req.params.id
    var peerId = req.user.id
    var username = req.user.email
    // var videoChat
    // var isRoomCreated = false
    VideoChat.find({'_id': videoChatId}, function (err, videoChat) {
      if (err) {
        console.log('Error /videoChat/:id : %s ', err)
        res.status(500).send(err)
      }

      /*
       if (videoChat.length==0) {
       createVideoChat(videoChatId, function (err) {
       if (err) {
       console.log("Error /videoChat/:id : %s ", err)
       res.status(500).send(err)
       }else{
       isRoomCreated=true
       }
       })
       }
       Peer.find({"videoChatId": videoChatId, "id": peerId}, function (err, peer) {
       if (peer.length==0) {
       createPeer(videoChatId, peerId, username, function () {
       if (err) {
       console.log("Error /videoChat/:id : %s ", err)
       res.status(500).send(err)
       }
       })
       }else{
       console.log("Error /videoChat/:id : %s ", err)
       res.status(500).send("You already have an active session!")
       }
       })
       */
      Peer.find({'videoChatId': videoChatId, 'id': {$nin: [peerId]}},
        function (err, peers) {
          if (err) {
            console.log('Error /videoChat/:id : %s ', err)
            res.status(500).send(err)
          }
          res.render('trans_session/videoConference', {
            title: res.__('Video Conference'),
            roomId: videoChatId,
            peerId: peerId,
            peers: peers,
            username: username,
            config: config
          })
        })
    })
  })

  app.get('/peertest/:sessionId', function (req, res) {
    var sessionId = req.params.sessionId
    console.log(sessionId)
    res.render('trans_session/peer_test',
      {title: res.__('Linpret Language Services'), sessionID: sessionId})
  })

  /*
  function createVideoChat (id, callback) {
    // create the videoChat
    var videoChat = new VideoChat()
    videoChat._id = id
    videoChat.createdAt = new Date()
    videoChat.trans_lang = 'Tr > Eng'
    videoChat.save(function (err) {
      callback(err)
    })
  }

  function createPeer (videoChatId, peerId, username, callback) {
    var peer = new Peer()
    peer._id = peerId
    peer.userId = peerId
    peer.videoChatId = videoChatId
    peer.username = username
    peer.save(function (err) {
      callback(err)
    })
  }
  */
}
