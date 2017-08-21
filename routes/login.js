var http = require('http');
var moment = require('moment');
var config = require('config');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt-nodejs');

module.exports = function (app, passport, winston, emailserver) {


// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        if (req.user) {
            if (req.user.is_customer) {
                res.redirect('/dashboard');
            } else if (req.user.is_translator) {
                res.redirect('/dashboardt');
            } else if (req.user.is_linkedin_user) {
                res.redirect('/logout');
            }
        } else {
            res.render('index.ejs');
        }
    });


    // dashboard SECTION =========================
    app.get('/dashboard', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {
            var query = connection.query('select * from languages', function (err, languages) {

                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                req.getConnection(function (err1, connection) {
                    var query = connection.query('select ts.* from translation_session_users tu, translation_session' +
                        ' ts  where tu.user_id = ? and tu.translation_session_id = ts.id', req.user.id, function (err1, sessions) {

                        if (err1) {
                            console.log("Error Selecting : %s ", err1);
                        }

                        req.getConnection(function (err3, connection) {
                            var query = connection.query('select * from categories', function (err3, categories) {

                                var query = connection.query('select u.*, ts.id as session_id from' +
                                    ' translation_session ts, translation_session_users tsu, translation_session_demands tsd , users u where ' +
                                    'ts.id = tsu.translation_session_id and ' +
                                    'tsu.user_id = ? and ' +
                                    'tsd.translation_session_id=ts.id and ' +
                                    'tsd.user_id = u.id', req.user.id, function (err3, demandedTranslators) {


                                    res.render('user/dashboard.ejs', {
                                        user: req.user,
                                        langs: languages,
                                        lists: sessions,
                                        cats: categories,
                                        demandedTranslators: demandedTranslators,
                                        moment: moment,
                                        config: config
                                    });
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
        res.render('login.ejs', {message: req.flash('loginMessage'), customer: req.query.customer, openTokenRequest:false});
    });


    app.post('/login', function (req, res, next) {
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
                if (user.is_translator) {
                    return res.redirect('/dashboardt');
                } else {
                    res.redirect('/dashboard');
                }
            });
        })(req, res, next);
    });

    //emial verify ============


    app.post('/send-verify-email-again', function (req, res, next) {

        req.getConnection(function (err, connection) {
            connection.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
                if (err) {
                    res.render('login.ejs', {message: 'Oops something went wrong. Please try again', customer: req.query.customer, openTokenRequest:true});
                    return;
                }

                if (!rows.length) {
                    res.render('login.ejs', {message:  'No user found.', customer: req.query.customer, openTokenRequest:true});
                    // req.flash is the way to set flashdata using connect-flash
                    return;
                }

                var token = randomstring.generate({
                    length: 64
                });
                var updatequery = "update users set email_verification_code =?  where email=?";

                connection.query(updatequery, [token, req.body.email], function (err, rowsUpdate) {
                    if (err) {
                        res.render('login.ejs', {message: 'Oops! something wrong. Please try again', customer: req.query.customer, openTokenRequest:true});
                        return;
                    }else {
                        rows[0].email_verification_code = token;
                        sendVerificationEmail(req, rows[0], res, emailserver);
                        res.render('login.ejs', {message:  'New verification email has been sent. Please check your email', customer: req.query.customer, openTokenRequest:false});
                        return;
                    }
                });


            });
        });

    });


    app.get('/verify-email', function (req, res) {

        if (req.query.token != null) {
            req.getConnection(function (err, connection) {
                var query = connection.query('select * from users where email_verification_code= ?', [req.query.token], function (err, rows) {

                    if (err) {
                        res.render('login.ejs', {
                            message: 'Your verification token has been expired. You can get new verification token. Please type your email address',
                            customer: req.query.customer,
                            openTokenRequest: true

                        });
                    }else {
                        if (rows.length) {

                            var updatequery = "update users set email_verification_code =? , is_email_verification=?  where email_verification_code=?";

                            connection.query(updatequery, [null, 1, req.query.token], function (err, rows) {
                                if (err) {
                                    res.render('login.ejs', {
                                        message: 'Your token has been expired. You can get new token email under the below. Please type your email address',
                                        customer: req.query.customer,
                                        openTokenRequest: true
                                    });
                                } else {
                                    res.render('login.ejs', {
                                        message: 'Thank you. Your email has been verified. You can login now.',
                                        customer: req.query.customer,
                                        openTokenRequest: false
                                    });
                                }
                            });
                        }else{
                            res.render('login.ejs', {
                                message: 'Your verification token has been expired. You can get new verification token. Please type your email address',
                                customer: req.query.customer,
                                openTokenRequest: true

                            });
                        }
                    }


                });
            });
        } else {
            res.render('signup.ejs', {message: req.flash('signupMessage'), customer: req.query.customer});
        }

    });


    ////Password Change request======================


    app.get('/login', function (req, res) {
        res.render('login.ejs', {message: req.flash('loginMessage'), customer: req.query.customer, openTokenRequest:false});
    });


    app.get('/verify-password', function (req, res) {

        if(req.query.token){
                req.getConnection(function (err, connection) {
                    var query = connection.query('select * from users where password_verification_code= ?', [req.query.token], function (err, rows) {

                        if (err) {
                            res.render('password-change.ejs', {
                                message: 'Your password verification token has been expired. You can get new verification token. Please type your email address',
                                openTokenRequest: true

                            });
                        }else {
                            if (rows.length) {

                                res.render('password-change.ejs', {
                                    message: 'Please type your new password',
                                    openTokenRequest: false

                                });
                            }else{
                                res.render('password-change.ejs', {
                                    message: 'Your verification token has been expired. You can get new verification token. Please type your email adress',
                                    openTokenRequest: true

                                });
                            }
                        }
                });
            });
        }else{

        }
    });


    app.post('/change-password-request', function (req, res) {

        var code = randomstring.generate({
            length: 64
        });
        if(req.query.email){
            req.getConnection(function (err, connection) {
                connection.query("UPDATE users set password_verification_code = ? WHERE email = ? ", [code, req.query.email], function (err, rows) {

                    if (err) {
                        console.log("Error Updating : %s ", err);
                        res.end( "Opps something is wrong. Please try again." );
                    }else{
                        emailserver.send({
                            text:    "Linpret Password Verification link:" + req.protocol + '://' + req.get('host') + '/verify-password?token='+ code,
                            from:    "linpretinfo@gmail.com",
                            to:     req.query.email,
                            cc:      "semih.kahya08@gmail.com",
                            subject: "Linpret Password Verification"
                        }, function(err, message) { console.log(err || message); });
                    }

                    res.end( "Password change request has been sent to your email address. Please check your email" );

                });

            });
        }else{
            res.end( "Opps something went wrong. Please try again." );
        }
    });

    app.post('/send-verify-password-again', function (req, res, next) {

        req.getConnection(function (err, connection) {
            connection.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
                if (err) {
                    res.render('password-change.ejs', {message: 'Oops something went wrong. Please try again', customer: req.query.customer, openTokenRequest:true});
                    return;
                }

                if (!rows.length) {
                    res.render('password-change.ejs', {message:  'No user found.', customer: req.query.customer, openTokenRequest:true});
                    return;
                }else{
                    emailserver.send({
                        text:    "Linpret Password Verification link:" + req.protocol + '://' + req.get('host') + '/verify-password?token='+ rows[0].password_verification_code,
                        from:    "linpretinfo@gmail.com",
                        to:     rows[0].email,
                        cc:      "semih.kahya08@gmail.com",
                        subject: "Linpret Password Verification"
                    }, function(err, message) { console.log(err || message); });

                    res.render('login.ejs', {
                        message: 'Your password change request has been sent to your email. Please check your email.',
                        customer: req.query.customer,
                        openTokenRequest: false
                    });
                    return;
                }

            });
        });

    });

    app.post('/change-password', function (req, res, next) {

        if(req.body.password != req.body.repassword){
            res.render('password-change.ejs', {message: 'Please use same password again', customer: req.query.customer, openTokenRequest:false});
            return;
        }else {

            req.getConnection(function (err, connection) {
                connection.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
                    if (err) {
                        res.render('password-change.ejs', {
                            message: 'Oops something went wrong. Please try again',
                            customer: req.query.customer,
                            openTokenRequest: false
                        });
                        return;
                    }

                    if (!rows.length) {
                        res.render('password-change.ejs', {
                            message: 'No user found.',
                            customer: req.query.customer,
                            openTokenRequest: false
                        });
                        // req.flash is the way to set flashdata using connect-flash
                        return;
                    }

                    var password = bcrypt.hashSync(req.body.password, null, null);
                    var code = randomstring.generate({
                        length: 64
                    });
                    var updatequery = "update users set password =?, password_verification_code=?  where email=?";

                    connection.query(updatequery, [password,code, req.body.email], function (err, rowsUpdate) {
                        if (err) {

                            res.render('password-change.ejs', {
                                message: 'Oops something went wrong. Please try again',
                                customer: req.query.customer,
                                openTokenRequest: false
                            });
                            return;

                        } else {

                            res.render('login.ejs', {
                                message: 'Your password has been changed.',
                                customer: req.query.customer,
                                openTokenRequest: false
                            });
                            return;
                        }
                    });


                });
            });
        }

    });

// linkedin -------------------------------
    app.get('/auth/linkedin',
        passport.authenticate('linkedin', function (req, res) {
            // The request will be redirected to LinkedIn for authentication, so this
            // function will not be called.
            console.log("here another");
        }));

    app.get('/auth/linkedin/callback', passport.authenticate('linkedin',
        {
            successRedirect: '/selector',
            failureRedirect: '/login'
        }));

    app.get('/selector', isLoggedIn , function (req, res) {
        if (req.user.isNew) {
            return res.redirect('/dashboard/select');
        }
        if (req.user.is_translator) {
            return res.redirect('/dashboardt');
        }
        if (req.user.is_customer) {
            return res.redirect('/dashboard');
        }
    });


// facebook -------------------------------

// send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

// handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

// twitter --------------------------------

// send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

// handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

// google ---------------------------------

// send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

// the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/dashboard',
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
        successRedirect: '/dashboard', // redirect to the secure dashboard section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// facebook -------------------------------

// send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

// handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

// twitter --------------------------------

// send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));

// handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));


// google ---------------------------------

// send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

// the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/dashboard',
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
            res.redirect('/dashboard');
        });
    });

// facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });

// twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });

// google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
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
