var http = require('http');

module.exports = function (app, passport, winston) {


// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {
            var query = connection.query('select * from languages', function (err, rows) {

                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                req.getConnection(function (err1, connection) {
                    var query = connection.query('select ts.* from translation_session_users tu, translation_session ts' +
                        '  where tu.user_id = ? and tu.id = ts.id ', req.user.id, function (err1, rows2) {

                        if (err1) {
                            console.log("Error Selecting : %s ", err1);
                        }

                        req.getConnection(function (err3, connection) {
                            var query = connection.query('select * from categories', function (err3, rows3) {
                                res.render('profile.ejs', {
                                    user: req.user,
                                    langs: rows,
                                    lists: rows2,
                                    cats: rows3
                                });
                            })
                        })
                    });
                });
            });
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


    app.post('/login', function (req, res, next) {
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
                var email = user.email;
                winston.log('info', 'logged in email:' + user.email);
                if (!isCustomer) {
                    req.getConnection(function (err, connection) {

                        var sql = "SELECT id FROM translators" +
                            " WHERE  translators.email = ?";

                        var query = connection.query(sql, [email], function (err, rows) {

                            var translator = rows[0];

                            if (err)
                                console.log("Error Selecting : %s ", err);

                            if (rows.length > 0)
                                return res.redirect('/translator/' + translator.id);
                            else {   // if user is not translator then check if is it user
                                var usersql = "SELECT id FROM user" +
                                    " WHERE  email = ?";

                                var query = connection.query(usersql, [email], function (err, rows) {

                                    var user = rows[0];

                                    if (err)
                                        console.log("Error Selecting : %s ", err);

                                    if (rows.length > 0)
                                        return res.redirect('/user/' + user.id);
                                    else
                                        return res.redirect('/login');
                                });
                            }

                        });

                    });
                } else {
                    res.redirect('/profile');
                }
            });
        })(req, res, next);
    });

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
                    var sql = "SELECT id FROM translators" +
                       " WHERE  translators.email = ?";

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
                    req.getConnection(function (err, connection) {
                        var query = connection.query('select * from languages', function (err, rows) {

                            if (err)
                                console.log("Error Selecting : %s ", err);

                            res.redirect('/profile?customer=true');
                        });

                    });

                }
            });
        })(req, res, next);
    });

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup',
        passport.authenticate('local-signup', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/signup', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }
        /*
        ,
            function (err, user, info) {
                var post_data = {
                    name: 'aa',
                    address: '',
                    email: user.local.email,
                    phone: '',
                    user_type: 'SIMU_TRANSLATER',
                    time_zone: '+2 GMT',
                    country_code: 'EN'
                };

                var options = {
                    host: 'localhost',
                    port: 4300,
                    path: '/users/add',
                    method: 'POST'
                };

                var post_req = http.request(options, function(res) {
                    console.log('STATUS: ' + res.statusCode);
                    console.log('HEADERS: ' + JSON.stringify(res.headers));
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        console.log('BODY: ' + chunk);
                    });
                });
                // post the data
                post_req.write(post_data);
                post_req.end();
            }
            */
        )
    );

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
