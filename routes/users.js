// var VideoChat = require('../app/models/videochat')
// var Peer = require('../app/models/videochatpeer')
var moment = require('moment')

module.exports = function (app) {
  app.post('/users/edit/:id', function (req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body))
    var id = req.params.id

    req.getConnection(function (err, connection) {
      if (err) return next(err)
      var data = {
        name: input.name,
        address: input.address,
        email: input.email,
        phone: input.phone
      }
      connection.query('UPDATE user set ? WHERE id = ? ', [data, id],
        function (err, rows) {
          if (err) return next(err)

          res.redirect('users')
        })
    })
  })

  app.post('/users/add', function (req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body))

    req.getConnection(function (err, connection) {
      if (err) return next(err)
      var data = {
        name: input.name,
        address: input.address,
        email: input.email,
        phone: input.phone,
        user_type: 'SIMU_TRANSLATER',
        time_zone: '+2 GMT',
        country_code: 'EN'
      }

      connection.query('INSERT INTO user set ? ', data, function (err, rows) {
        if (err) return next(err)
        res.redirect('users')
      })
    })
  })

  app.get('/users', function (req, res, next) {
    req.getConnection(function (err, connection) {
      if (err) return next(err)
      connection.query('SELECT * FROM users ', function (err, rows) {
        if (err) return next(err)
        res.render('user/users', {page_title: 'Users List', data: rows})
      })
    })
  })

  app.get('/users/add', function (req, res, next) {
    res.render('user/add_user', {page_title: 'Add user'})
  })

  app.get('/users/delete/:id', function (req, res, next) {
    var id = req.params.id
    req.getConnection(function (err, connection) {
      if (err) return next(err)
      connection.query('DELETE FROM user  WHERE id = ? ', [id],
        function (err, rows) {
          if (err) return next(err)
          res.redirect('users')
        })
    })
  })

  app.get('/users/edit/:id', function (req, res, next) {
    var id = req.params.id
    req.getConnection(function (err, connection) {
      if (err) return next(err)
      connection.query('SELECT * FROM users WHERE id = ?', [id],
        function (err, rows) {
          if (err) return next(err)
          res.render('user/edit_user', {page_title: 'User Edit', data: rows})
        })
    })
  })

  app.get('/user/:id', function (req, res, next) {
    var userid = req.params.id
    req.getConnection(function (err, connection) {
      if (err) return next(err)

      doQueries(connection, userid, function (err, rows2) {
        if (err) return next(err)
        res.render('user/user-dashboard', {
          page_title: 'User Dashboard page',
          data: rows2[0],
          lists: rows2,
          user: req.user,
          moment: moment
        })
      })
    })
  })

  // for rest call without redirection
  app.get('/userData/:id', function (req, res, next) {
    var userid = req.params.id
    req.getConnection(function (err, connection) {
      if (err) return next(err)
      connection.query('SELECT * FROM users where id=?', [userid],
        function (err, rows) {
          if (err) {
            return next(err)
          } else {
            res.send(rows[0])
          }
        })
    })
  })
}
function doQueries (connection, userid, callback) {
  var sql2 = ' select u.*,ts.id,lang1,lang2,topic,duration,start_date,start_time ' +
    ' from user u,translation_session ts,  translation_session_users  tsu' +
    ' where ts.id=tsu.translation_session_id' +
    ' and tsu.user_id=u.id' +
    ' and tsu.user_id=?' +
    ' order by start_date,start_time'

  connection.query(sql2, [userid], function (err2, rows2) {
    if (err2) {
      return callback(err2)
    } else {
      return callback(null, rows2)
    }

    /* i = 0;
     rows2.forEach(function (videoChat) {
     var peers;
     Peer.find({"videoChatId": videoChat.id}, function (err, peers) {
     if (err) {
     callback(err);
     return;
     }
     videoChat.peers = peers;
     i++;
     if (i == rows2.length) {
     callback(null, rows2);
     return;
     }
     });
     });
     */
  })
}
