module.exports = function (app, passport, winston) {


// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function (req, res) {
        res.render('login.ejs', {message: req.flash('loginMessage'), customer: req.query.customer});
    });

    app.post('/login', function (req, res) {
        var isCustomer = req.query.customer;
        passport.authenticate('local-login', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/login');
            }
            req.logIn(user, function (err) {
                if (err) {
                    winston.log('error', 'login error' + err);
                    return next(err);
                }
                var email = user.local.email;
                winston.log('info', 'logged in email:' + user.local.email);
                if (isCustomer) {
                    req.getConnection(function (err, connection) {

                        var sql = "SELECT * FROM translators," +
                            " (SELECT t.id," +
                            "     GROUP_CONCAT(concat(" +
                            "         (select lang_desc from languages where lang_short=lang_from),'>')," +
                            " (select lang_desc from languages where lang_short=lang_to)" +
                            " ORDER BY lang_from SEPARATOR ' , ') as languages" +
                            " FROM translators t" +
                            " LEFT JOIN translator_lang tl" +
                            " ON t.id=tl.translator_id" +
                            " GROUP BY t.id) AS JOINRESULT" +
                            " WHERE translators.id = JOINRESULT.id and  translators.email = ?";

                        var query = connection.query(sql, [email], function (err, rows) {

                            var translator = rows[0];

                            if (err)
                                console.log("Error Selecting : %s ", err);

                            res.redirect('/translator/' + translator.id);

                        });

                    });

                }

            });
        })(err, user, info);
    });

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {

        if (!req.query.customer) {
            req.getConnection(function (err, connection) {
                var query = connection.query('select * from languages', function (err, rows) {

                    if (err)
                        console.log("Error Selecting : %s ", err);

                    res.render('signup.ejs', {
                        message: req.flash('signupMessage'),
                        customer: req.query.customer,
                        dataLang: rows
                    });

                });
            });
        } else {
            res.render('signup.ejs', {message: req.flash('signupMessage'), customer: req.query.customer});
        }

    });

    // process the signup form
    app.post('/signup', function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {

            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/signup');
            }
            req.logIn(user, function (err) {
                if (!req.query.customer) {
                    var input = JSON.parse(JSON.stringify(req.body));

                    req.getConnection(function (err, connection) {

                        var data = {
                            username: input.username,
                            name: input.name,
                            surname: input.surname,
                            email: input.email
                        };

                        var query = connection.query("INSERT INTO translators set ? ", data, function (err, results, rows) {

                            if (err) {
                                console.log("Error inserting : %s ", err);
                            } else {
                                var insertId = results.insertId;
                                console.log(insertId);
                                langListCarrier = input.langListCarrier;
                                var values = [];
                                langListCarrier.split(";").filter(function (e) {
                                    return e
                                }).forEach(function (item) {
                                    values.push([insertId, item.split(",")[0], item.split(",")[1]]);
                                });
                                var query2 = connection.query("INSERT INTO translator_lang (translator_id, lang_from, lang_to) values ? ", [values], function (err2, rows2) {

                                    if (err2) {
                                        console.log("Error inserting : %s ", err2);
                                    }
                                });
                            }
                            res.redirect('profile');
                        });
                    });
                } else {
                    res.redirect('profile?customer=true');
                }
            });
        })(req, res, next);
    });

// facebook -------------------------------

// send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

// handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

// twitter --------------------------------

// send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

// handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


// google ---------------------------------

// send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

// the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

// locally --------------------------------
    app.get('/connect/local', function (req, res) {
        res.render('connect-local.ejs', {message: req.flash('loginMessage')});
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// facebook -------------------------------

// send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

// handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

// twitter --------------------------------

// send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));

// handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


// google ---------------------------------

// send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

// the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

// local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function (req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

// facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

// twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

// google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

}
;

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
