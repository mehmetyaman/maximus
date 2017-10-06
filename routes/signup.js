var util = require('../app/utils/util')

module.exports = function (app, passport, emailserver) {
    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res, next) {
        // var sql = 'SELECT id FROM translators WHERE  translators.email = ?'

        req.getConnection(function (err, connection) {
            if (err) return next(err)
            connection.query('select * from languages', function (err, rows) {
                if (err) return next(err)
                res.render('user/signup.ejs', {
                    messages: req.flash('signupMessage'),
                    customer: req.query.customer,
                    dataLang: rows,
                    formData: null,
                    errors: []
                })
            })
        })
    })

    app.get('/signupt', function (req, res, next) {
        req.getConnection(function (err, connection) {
            if (err) return next(err)
            connection.query('select * from languages', function (err, rows) {
                if (err) return next(err)

                res.render('translator/signupt.ejs', {
                    messages: req.flash('signupMessage'),
                    dataLang: rows,
                    formData: null // Get formdata back into a variable
                })
            })
        })
    })

    // process the user signup form
    app.post('/signup', function (req, res, next) {
        req.check('email', 'A valid email address is required').isEmail()  // Validate email
        req.check('name',
            'Name field can not be empty and has to be minimum 2 character maximum 25').len(2, 25)
        req.check('surname',
            'Surname field can not be empty and has to be minimum 2 character maximum 25').len(2, 25)
        req.check('password',
            'Password field can not be empty and has to be minimum 6 character maximum 20').len(6, 20)
        req.check('password', 'Passwords do not match').equals(req.body.repassword)
        req.getValidationResult().then(function (result) {
            var errors = req.validationErrors()
            if (errors) {
                var messages = []
                errors.forEach(function (error) {
                    messages.push(error.msg)
                })
                if (req.body.linkedincycle) {
                    return res.redirect('/logout')
                } else {
                    return res.render('user/signup', {
                        messages: messages, // pass it here to access in view file
                        formData: req.body,
                        errors: errors
                    })
                }
            } else {
                passport.authenticate('local-signup', function (err, user, info) {
                    if (err) {
                        return next(err)
                    }
                    if (!user) {
                        return res.render('user/signup', {
                            messages: req.flash('signupMessage'),
                            formData: req.body,
                            errors: errors
                        })
                    }
                    req.logIn(user, function (err) {
                        if (err) {
                            return next(err)
                        } else {
                            util.sendVerificationEmail(req, user, res, emailserver, next)
                            res.redirect('/signup-success')
                        }
                    })
                })(req, res, next)
            }
        })
    })

    // process the translator's signup form
    app.post('/signupt', function (req, res, next) {
        req.assert('email', 'A valid email address is required').isEmail()  // Validate email
        req.assert('name',
            'Name field can not be empty and has to be minimum 2 character maximum 25')
            .len(2, 25)
        req.assert('surname',
            'Surname field can not be empty and has to be minimum 2 character maximum 25')
            .len(2, 25)
        req.assert('password',
            'Password field can not be empty and has to be minimum 6 character maximum 20')
            .len(6, 20)
        req.assert('password', 'Passwords do not match').equals(req.body.repassword)

        req.getConnection(function (err, connection) {
            if (err) return next(err)
            connection.query('select * from languages', function (err, rows) {
                if (err) return next(err)
                req.getValidationResult().then(function (result) {
                    var errors = req.validationErrors()
                    if (errors) {
                        var messages = []
                        errors.forEach(function (error) {
                            messages.push(error.msg)
                        })
                        if (req.body.linkedincycle) {
                            return res.redirect('/logout')
                        } else {
                            return res.render('translator/signupt', {
                                messages: messages, // pass it here to access in view file
                                formData: req.body,
                                dataLang: rows
                            })
                        }
                    } else {
                        passport.authenticate('local-signup', function (err, user, info) {
                            if (err) {
                                return next(err)
                            }
                            if (!user) {
                                return res.render('translator/signupt', {
                                    messages: req.flash('signupMessage'),
                                    formData: req.body,
                                    dataLang: rows
                                })
                            }
                            req.logIn(user, function (err) {
                                if (err) return next(err)
                                var input = JSON.parse(JSON.stringify(req.body))
                                req.getConnection(function (err, connection) {
                                        if (err) return next(err)
                                        var langListCarrier = input.langListCarrier
                                        var values = []
                                        langListCarrier.split(';').filter(function (e) {
                                            return e
                                        }).forEach(function (item) {
                                            var langs = item.split(',')
                                            values.push([user.id, langs[0], langs[1], langs[2]])
                                        })
                                        connection.query(
                                            'INSERT INTO translator_lang (translator_id, lang_from, lang_to, price_per_hour) values ? ',
                                            [values], function (err, rows2) {
                                                if (err) {
                                                    return next(err)
                                                } else {
                                                    util.sendVerificationEmail(req, user, res, emailserver, next)
                                                    res.redirect('/signup-success')
                                                }
                                            })
                                    }
                                )
                            })
                        })(req, res, next)
                    }
                })
            })
        })
    })

// SIGNUP =================================
// show the signup form
    /*
     app.get('/signup', function (req, res) {
     res.render('signup.ejs', {message: req.flash('signupMessage')});
     });
     */
    // show the signup success page
    app.get('/signup-success', function (req, res) {
        res.render('signup-success.ejs',
            {message: 'A verification email have been sent to your email address'})
    })
}
