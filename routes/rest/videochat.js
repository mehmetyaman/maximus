var VideoChat = require('../../app/models/videochat')
var Peer = require('../../app/models/videochatpeer')

module.exports = function (app) {
  app.get('/peers/:videoChatId', function (req, res, next) {
    var videoChatId = req.params.videoChatId
    Peer.find({'videoChatId': videoChatId}, function (err, peers) {
      if (err) {
        return next(err)
      } else {
        res.send(peers)
      }
    })
  })

  app.get('/videoChats', function (req, res, next) {
    VideoChat.find({}, function (err, videoChats) {
      if (err) {
        return next(err)
      } else {
        res.send(videoChats)
      }
    })
  })

  app.put('/videoChat/save/:id', function (req, res, next) {
    var id = req.params.id
    createVideoChat(id, function (err) {
      if (err) {
        return next(err)
      } else {
        res.send(res.__('VideoChat has been created!'))
      }
    })
  })

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

  app.delete('/videoChat/remove/:id', function (req, res, next) {
    var id = req.params.id
    VideoChat.remove({'_id': id}, function (err) {
      if (err) {
        return next(err)
      } else {
        res.send(res.__('VideoChat has been deleted!'))
      }
    })
  })

  app.get('/peer/remove/:videoChatId/:peerId', function (req, res, next) {
    var videoChatId = req.params.videoChatId
    var peerId = req.params.peerId
    Peer.remove({'videoChatId': videoChatId, 'userId': peerId}, function (err) {
      if (err) {
        return next(err)
      } else {
        console.log('Peer has been deleted!')
        res.send(res.__('Peer has been deleted!'))
      }
    })
  })

  app.put('/peer/save/:videoChatId/:peerId', function (req, res, next) {
    var videoChatId = req.params.videoChatId
    var peerId = req.params.peerId
    var username = 'x'
    createPeer(videoChatId, peerId, username, function (err) {
      if (err) {
        return next(err)
      } else {
        console.log('Peer has been attended!')
        res.send(res.__('Peer has been attended!'))
      }
    })
  })

  app.get('/videoChat/:id', function (req, res, next) {
    var videoChatId = req.params.id
    var peerId = req.user.id
    var username = req.user.email
    VideoChat.find({'_id': videoChatId}, function (err, videoChat) {
      if (err) {
        return next(err)
      }
      if (videoChat.length === 0) {
        createVideoChat(videoChatId, function (err) {
          if (err) {
            return next(err)
          }
        })
      }
      Peer.find({'videoChatId': videoChatId, 'id': peerId},
        function (err, peer) {
          if (peer.length === 0) {
            createPeer(videoChatId, peerId, username, function () {
              if (err) {
                return next(err)
              }
            })
          } else {
            throw Error(res.__('You already have an active session!'))
          }
        })

      Peer.find({'videoChatId': videoChatId, 'id': {$nin: [peerId]}},
        function (err, peers) {
          if (err) {
            return next(err)
          }
          res.render('trans_session/appear2',
            {title: 'Video Conference', sessionID: peerId, peers: peers})
        })
    })
  })
}
