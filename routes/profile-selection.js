module.exports = function (app) {
  app.get('/dashboard/select', function (req, res, next) {
    res.render('profile-selection.ejs')
  })

  app.post('/dashboard/select', function (req, res, next) {
    var selectedProfile = req.body['profile-selection']
    var linkedinprofile = req.session.linkedinprofile
    var isCustomer = selectedProfile === 'acustomer' ? 1 : 0
    var isTranslator = selectedProfile === 'atranslator' ? 1 : 0

    //  is_customer | is_translator | is_linkedin_user
    req.getConnection(function (err, connection) {
      if (err) return next(err)
      connection.query(
        'update users set is_translator=?,is_customer=?, is_linkedin_user=? where' +
        ' linkedin_id=? ',
        [isTranslator, isCustomer, 1, linkedinprofile.id],
        function (err, results, rows) {
          if (err) return next(err)

          if (selectedProfile === 'atranslator') {
            // cont as a translator

            connection.query('select * from languages', function (err1, rows1) {
              if (err1) return next(err1)

              res.render('signup.ejs', {
                message: req.flash('signupMessage'),
                customer: false,
                linkedinprofile: linkedinprofile,
                dataLang: rows1
              })
            })
          } else if (selectedProfile === 'acustomer') {
            // cont as a customer
            res.redirect('/dashboard')
          }
        })
    })
  })
}
