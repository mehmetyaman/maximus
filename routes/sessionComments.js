/**
 * Created by semihkahya on 24.07.2017.
 */

module.exports = function (app) {
  app.get('/session-comments', function (req, res, next) {
    var qstr = 'select * from users where email =? '

    req.getConnection(function (err, connection) {
      if (err) return next(err)
      connection.query(qstr, [req.user.email], function (err, user) {
        if (err) return next(err)
        if (user.is_translator) {
          return res.redirect('/dashboardt')
        } else {
          var sessionId = req.query.sessionID
          if (!sessionId) {
            return res.redirect('/dashboard')
          } else {
            var session = 'select * from translation_session where id =? '

            connection.query(session, [sessionId], function (err, session) {
              if (err) {
                return next(err)
              } else {
                var tanslatorId = session[0].translator_id
                var translator = 'select * from users where id =? '
                connection.query(translator, [tanslatorId],
                  function (err, translator) {
                    if (err) {
                      return next(err)
                    } else {
                      res.render('session-comments.ejs', {
                        user: req.user,
                        sessionId: sessionId,
                        session: session[0],
                        translator: translator[0]
                      })
                    }
                  })
              }
            })
          }
        }
        // res == true
        console.log(res)
      })
    })
  })

  app.post('/send-session-comments', function (req, res, next) {
    if (req.query.sessionId) {
      req.getConnection(function (err, connection) {
        if (err) return next(err)
        connection.query('select * from translation_session where id =? ',
          [req.query.sessionId], function (err, session) {
            if (err) {
              return next(err)
            } else {
              var translatorId = session[0].translator_id

              var starAndComment = {
                translation_session_id: translatorId,
                user_id: req.query.userId,
                star: req.body.star,
                comment: req.body.comment
              }

              connection.query(
                'INSERT INTO translation_session_star_and_comment set ? ',
                starAndComment, function (err, starComment) {
                  if (err) {
                    return next(err)
                  }
                })

              connection.query(
                'select * from translator_sessions_mean_star where user_id =? ',
                [translatorId], function (err, starMean) {
                  if (err) {
                    return next(err)
                  }
                  if (starMean.length < 1) {
                    var mean = {
                      mean_star: req.body.star,
                      star_count: 1,
                      user_id: translatorId
                    }

                    connection.query(
                      'INSERT INTO translator_sessions_mean_star set ? ', mean,
                      function (err, insertStar) {
                        if (err) {
                          return next(err)
                        }
                      })
                  } else {
                    var m = starMean[0]
                    m.mean_star = ((m.mean_star * m.star_count) +
                      parseInt(req.body.star)) / (m.star_count + 1)
                    m.star_count = m.star_count + 1

                    connection.query(
                      'update translator_sessions_mean_star set mean_star =? , star_count=?  where user_id=? ',
                      [m.mean_star, m.star_count, m.user_id],
                      function (err, updateMean) {
                        if (err) {
                          return next(err)
                        }
                        req.flash('message',
                          res.__('Your review have been recorded'))
                        res.redirect('/dashboard')
                      })
                  }
                })
            }
          })
      })
    } else {
      return new Error('no session id')
    }
  })
}
