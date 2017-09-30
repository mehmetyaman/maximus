// var Peer = require('../app/models/videochatpeer')
var moment = require('moment')

module.exports = function (app) {
    // DASHBOARD SECTION =========================
    app.get('/dashboardt', function (req, res, next) {
        req.getConnection(function (err, connection) {
            if (err) return next(err)
            connection.query('select * from languages', function (err, langs) {
                if (err) return next(err)
                var sql = 'select * from translation_session ts  ' +
                    'where (ts.translator_id = ? or ts.translator_id = 0 ) and ' +
                    'exists ( select * from translator_lang tl where (tl.translator_id=?) ' +
                    'and ((lang1=lang_from and lang2=lang_to) or (lang1=lang_to and lang2=lang_from)))'
                connection.query(sql, [req.user.id, req.user.id],
                    function (err1, translationRequests) {
                        if (err1) {
                            return next(err1)
                        }
                        connection.query('select * from categories',
                            function (err3, categories) {
                                if (err3) return next(err3)
                                var appropriateRequests = translationRequests
                                if (appropriateRequests.length > 0) {
                                    var sqlForDemands = 'select * from translation_session_demands where user_id=?'
                                    connection.query(sqlForDemands, req.user.id,
                                        function (errDemands, demands) {
                                            if (errDemands) return next(errDemands)
                                            if (demands.length > 0) {
                                                appropriateRequests.forEach(function (request) {
                                                    demands.forEach(function (demand) {
                                                        if (request.translator_id === 0 &&
                                                            request.id === demand.translation_session_id) {
                                                            request.is_demanded = true
                                                        }
                                                    })
                                                })
                                            }
                                            res.render('translator/dashboardt.ejs', {
                                                user: req.user,
                                                langs: langs,
                                                lists: appropriateRequests,
                                                cats: categories,
                                                moment: moment
                                            })
                                        })
                                } else {
                                    res.render('translator/dashboardt.ejs', {
                                        user: req.user,
                                        langs: langs,
                                        lists: appropriateRequests,
                                        cats: categories,
                                        moment: moment
                                    })
                                }
                            })
                    })
            })
        })
    })

    app.post('/assignSession/:id', function (req, res, next) {
        var id = req.params.id
        req.getConnection(function (err, connection) {
            if (err) return next(err)
            connection.query(
                'UPDATE translation_session set translator_id = ? WHERE id = ? ',
                [req.user.id, id], function (err, rows) {
                    if (err) return next(err)
                    res.redirect('dashboardt')
                })
        })
    })

    app.get('/profile', function (req, res) {
        res.render('translator/profile.ejs', {user: req.user})
    })

    app.get('/profile/:id', function (req, res) {
        loadTranslator(req, res, function (translator, err) {
            res.render('translator/profile.ejs',
                {user: req.user, translator: translator[0]})
        })
    })

    app.post('/assign/translator/:translator_id/session/:session_id',
        function (req, res, next) {
            var translatorId = req.params.translator_id
            var sessionId = req.params.session_id
            req.getConnection(function (err, connection) {
                if (err) return next(err)
                connection.query(
                    'UPDATE translation_session set translator_id = ? WHERE id = ? ',
                    [translatorId, sessionId], function (err, rows) {
                        if (err) return next(err)
                        res.redirect('dashboardt')
                    })
            })
        })

    app.get('/demand/:id', function (req, res, next) {
        req.getConnection(function (err, connection) {
            if (err) return next(err)
            connection.query(
                'insert into translation_session_demands (user_id, translation_session_id) values (?,' +
                ' ?) ', [req.user.id, req.params.id], function (err, rows) {
                    if (err) {
                        return res.status(500).json({err: err});
                    }
                    return res.status(200).json([]);
                })
        })
    })

    function loadTranslator(req, res, callback) {
        var id = req.params.id
        req.getConnection(function (err, connection) {
            if (err) {
                return callback(null, err)
            }
            var sql1 = 'SELECT * FROM users WHERE id = ?'
            connection.query(sql1, [id], function (err, rows) {
                if (err) {
                    return callback(null, err)
                }
                var sql2 = 'SELECT (select lang_desc from languages where lang_short=lang_from) lang_from,' +
                    ' (select lang_desc from languages where lang_short=lang_to) lang_to,' +
                    ' price_per_hour' +
                    ' FROM translator_lang ' +
                    ' WHERE translator_id = ?'
                connection.query(sql2, [id], function (err2, rows2) {
                    if (err2) {
                        return callback(null, err2)
                    }
                    rows[0].languages = rows2
                    callback(rows)
                })
            })
        })
    }

    app.get('/translator/:id', function (req, res, next) {
        loadTranslator(req, res, function (translator, err) {
            if (err) {
                return next(err)
            } else {
                res.contentType('application/json')
                res.end(JSON.stringify(translator, null, 2))
            }
        })
    })
}

/**
 function do_queries (connection, id, callback) {
  var sql1 = 'SELECT * FROM users,' +
    ' (SELECT t.id,' +
    '     GROUP_CONCAT(concat(' +
    '         (select lang_desc from languages where lang_short=lang_from),\'>\'),' +
    ' (select lang_desc from languages where lang_short=lang_to)' +
    ' ORDER BY lang_from SEPARATOR \' , \') as languages' +
    ' FROM users t' +
    ' LEFT JOIN translator_lang tl' +
    ' ON t.id=tl.translator_id ' +
    ' GROUP BY t.id) AS JOINRESULT' +
    ' WHERE users.id = JOINRESULT.id and  users.id = ?'

  // var sessionList = "";
  var sql2 = 'select * from translation_session where (translator_id=? or translator_id = 0) ' +
    'order by start_date,start_time'

  connection.query(sql1, [id], function (err, rows) {
    if (err) {
      callback(err)
      return
    }
    connection.query(sql2, [id], function (err2, rows2) {
      if (err2) {
        callback(err2)
        return
      }

      var i = 0
      if (rows2.length > 0) {
        rows2.forEach(function (videoChat) {
          Peer.find({'videoChatId': videoChat.id}, function (err, peers) {
            if (err) {
              callback(err)
              return
            }
            videoChat.peers = peers
            i++
            if (i === rows2.length) {
              callback(null, rows, rows2)
            }
          })
        })
      } else {
        callback(null, [], [])
      }
    })
  })
}
 **/
