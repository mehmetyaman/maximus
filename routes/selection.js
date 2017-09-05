module.exports = function (app) {
  app.get('/selection/session/:id', function (req, res, next) {
    var sessionId = req.params.id

    req.getConnection(function (err, connection) {
      if (err) return next(err)
      connection.query(
        'select  u.id as user_id, u.name as name, u.surname as surname, ts.id as' +
        ' session_id, u.picture_url as picture_url from' +
        ' translation_session ts, translation_session_users tsu, translation_session_demands tsd , users u where ' +
        'ts.id = tsu.translation_session_id and ' +
        'tsu.user_id = ? and ' +
        'tsd.translation_session_id=ts.id and ' +
        'tsd.user_id = u.id and ts.id=? ', [req.user.id, sessionId],
        function (err, demandedTranslators) {
          if (err) return next(err)
          res.render('selection.ejs', {
            user: req.user,
            demandedTranslators: demandedTranslators
          })
        })
    })
  })

  app.get('/selection/session/:id/translator/:translator_id',
    function (req, res, next) {
      var sessionId = req.params.id
      var translatorId = req.params.translator_id

      var ts = {
        translation_session_id: sessionId,
        user_id: translatorId
      }

      req.getConnection(function (err, connection) {
        if (err) return next(err)
        connection.query('INSERT INTO translation_session_users set ? ', ts,
          function (err, rows6) {
            if (err) return next(err)

            connection.query('update  translation_session set translator_id=?' +
              ' where id=? ', [translatorId, sessionId],
              function (err, rows6) {
                if (err) {
                  connection.rollback(function () {
                    throw err
                  })
                  console.log('Error inserting : %s ', err)
                  res.status(500).json({error: err})
                }
                res.redirect('/dashboard')
              })
          }
        )
      })
    })
}
