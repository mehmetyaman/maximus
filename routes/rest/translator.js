module.exports = function (app) {
  app.get('/searchTranslator/:key', function (req, res, next) {
    var key = req.params.key
    var trimmedKey = key.replace(/\s/g, '')
    // var trimmedKey = req.query.key.replace(/\s/g,'');
    var sql = 'SELECT u.id,name, surname, email FROM users u,' +
      ' (SELECT t.id' +
      ' FROM users t' +
      ' LEFT JOIN translator_lang tl' +
      ' ON t.id=tl.translator_id ' +
      ' GROUP BY t.id) AS JOINRESULT' +
      ' WHERE u.id = JOINRESULT.id ' +
      ' and IS_TRANSLATOR=\'1\' ' +
      ' and  concat(name,surname,email) like \'%' + trimmedKey + '%\' '
    req.getConnection(function (err, connection) {
      if (err) return next(err)

      connection.query(sql,
        function (err, rows, fields) {
          if (err) return next(err)
          // var data = [];
          // for (i = 0; i < rows.length; i++) {
          //    data.push("name:"+rows[i].name + " " + rows[i].surname + " " + rows[i].email + " ");
          // }
          res.contentType('application/json')
          res.end(JSON.stringify(rows, null, 2))
        })
    })
  })

  app.get('/searchTranslator/:lang1/:lang2', function (req, res, next) {
    var lang1 = req.params.lang1
    var lang2 = req.params.lang2
    var sql = ' SELECT t.id,name, surname, email' +
      ' FROM users t' +
      ' JOIN translator_lang tl' +
      ' ON t.id=tl.translator_id ' +
      ' and ((lang_from=\'' + lang1 + '\' and lang_to=\'' + lang2 + '\') or (lang_from=\'' + lang2 + '\'' +
      ' and lang_to=\'' + lang1 + '\'))'
    req.getConnection(function (err, connection) {
      if (err) return next(err)

      connection.query(sql,
        function (err, rows, fields) {
          if (err) return next(err)
          res.contentType('application/json')
          res.end(JSON.stringify(rows, null, 2))
        })
    })
  })
}
