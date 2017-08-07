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
                res.redirect('/profile');
            } else if (req.user.is_translator) {
                res.redirect('/profilet');
            } else if (req.user.is_linkedin_user) {
                res.redirect('/logout');
            }
        } else {
            res.render('index.ejs');
        }
    });


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
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


                                    res.render('profile.ejs', {
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
                    return res.redirect('/profilet');
                } else {
                    res.redirect('/profile');
                }
            });
        })(req, res, next);
    });

    //emial verify ============


    app.post('/send-verify-email-again', function (req, res, next) {

        req.getConnection(function (err, connection) {
            connection.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
                if (err) {
                    res.render('login.ejs', {message: 'Oops something wrong. Please try again', customer: req.query.customer, openTokenRequest:true});
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

                        res.render('login.ejs', {message: 'Oops something wrong. Please try again', customer: req.query.customer, openTokenRequest:true});
                        return;

                    }else {

                        rows[0].email_verification_code = token;
                        sendVerificationEmail(req, rows[0], res, emailserver);
                        res.render('login.ejs', {message:  'New verification email sended. Please look your email', customer: req.query.customer, openTokenRequest:false});
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
                            message: 'Your verification token expired. You can get new verification token. Please type your email adress',
                            customer: req.query.customer,
                            openTokenRequest: true

                        });
                    }else {
                        if (rows.length) {

                            var updatequery = "update users set email_verification_code =? , is_email_verification=?  where email_verification_code=?";

                            connection.query(updatequery, [null, 1, req.query.token], function (err, rows) {
                                if (err) {
                                    res.render('login.ejs', {
                                        message: 'Your token expired. You can get new token email under the below. Please type your email adress',
                                        customer: req.query.customer,
                                        openTokenRequest: true

                                    });
                                } else {

                                    res.render('login.ejs', {
                                        message: 'Your email is verifed. You can login now.',
                                        customer: req.query.customer,
                                        openTokenRequest: false
                                    });
                                }
                            });
                        }else{
                            res.render('login.ejs', {
                                message: 'Your verification token expired. You can get new verification token. Please type your email adress',
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

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
        var sql = "SELECT id FROM translators WHERE  translators.email = ?";

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
        req.assert('email', 'A valid email is required').isEmail();  //Validate email
        req.assert('name', 'Name field can not be empty and has to be minimum 2 character maximum 25').len(2, 25);
        req.assert('surname', 'Surname field can not be empty and has to be minimum 2 character maximum 25').len(2, 25);
        req.assert('password', 'Surname field can not be empty and has to be minimum 2 character maximum 20').len(6, 20);

        req.getValidationResult().then(function (result) {
            if (!result.isEmpty() || (req.body.password !== req.body.repassword)) {
                if (req.body.linkedincycle) {
                    return res.redirect("/logout");
                } else {
                    return res.redirect('/signup');
                }
            } else {
                passport.authenticate('local-signup', function (err, user, info) {

                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        return res.redirect('/signup');
                    }
                    req.logIn(user, function (err) {
                        if (user.is_translator) {
                            var input = JSON.parse(JSON.stringify(req.body));

                            req.getConnection(function (err, connection) {

                                    var data = {
                                        name: input.name,
                                        surname: input.surname,
                                        email: input.email
                                    };

                                    langListCarrier = input.langListCarrier;
                                    var values = [];
                                    langListCarrier.split(";").filter(function (e) {
                                        return e
                                    }).forEach(function (item) {
                                        values.push([user.id, item.split(",")[0], item.split(",")[1]]);
                                    });
                                    var query2 = connection.query("INSERT INTO translator_lang (translator_id, lang_from, lang_to) values ? ", [values], function (err2, rows2) {
                                        if (err2) {
                                            console.log("Error inserting : %s ", err2);
                                        }

                                        sendVerificationEmail(req, user, res, emailserver);
                                    });

                                }
                            );
                        }
                        else if (user.is_customer) {
                            {
                                sendVerificationEmail(req, user, res, emailserver);
                            }
                        }
                    });
                })(req, res, next);
            }
        });
    });


    function sendVerificationEmail(req, user, res, emailserver) {
        emailserver.send({
            text:    "Maximus Email Verification link is " + req.protocol + '://' + req.get('host') + '/verify-email?token='+ user.email_verification_code,
            from:    "linpretinfo@gmail.com",
            to:     user.email,
            cc:      "semih.kahya08@gmail.com",
            subject: "Linpret Email Verification"
        }, function(err, message) { console.log(err || message); });

        res.redirect('/signup-success');
    }


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
                                message: 'Your password verification token expired. You can get new verification token. Please type your email adress',
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
                                    message: 'Your verification token expired. You can get new verification token. Please type your email adress',
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
                        res.end( "Opps someting is wrong. Please try again." );
                    }else{
                        emailserver.send({
                            text:    "Maximus Password Verification link is " + req.protocol + '://' + req.get('host') + '/verify-password?token='+ code,
                            from:    "linpretinfo@gmail.com",
                            to:     req.query.email,
                            cc:      "semih.kahya08@gmail.com",
                            subject: "Linpret Password Verification"
                        }, function(err, message) { console.log(err || message); });
                    }

                    res.end( "Password change request send your email adress. Please check your email" );

                });

            });
        }else{
            res.end( "Opps someting is wrong. Please try again." );
        }
    });

    app.post('/send-verify-password-again', function (req, res, next) {

        req.getConnection(function (err, connection) {
            connection.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
                if (err) {
                    res.render('password-change.ejs', {message: 'Oops something wrong. Please try again', customer: req.query.customer, openTokenRequest:true});
                    return;
                }

                if (!rows.length) {
                    res.render('password-change.ejs', {message:  'No user found.', customer: req.query.customer, openTokenRequest:true});
                    return;
                }else{
                    emailserver.send({
                        text:    "Maximus Password Verification link is " + req.protocol + '://' + req.get('host') + '/verify-password?token='+ rows[0].password_verification_code,
                        from:    "linpretinfo@gmail.com",
                        to:     rows[0].email,
                        cc:      "semih.kahya08@gmail.com",
                        subject: "Linpret Password Verification"
                    }, function(err, message) { console.log(err || message); });

                    res.render('login.ejs', {
                        message: 'Your password change request is sended. Please check your emails.',
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
                            message: 'Oops something wrong. Please try again',
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
                                message: 'Oops something wrong. Please try again',
                                customer: req.query.customer,
                                openTokenRequest: false
                            });
                            return;

                        } else {

                            res.render('login.ejs', {
                                message: 'Your password is change.',
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
// SIGNUP =================================
// show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });



    // show the signup success page
    app.get('/signup-success', function (req, res) {
        res.render('signup-success.ejs', {message: "Verification email send your email address"});
    });

// process the signup form
    app.post('/signup',
        passport.authenticate('local-signup', {
                successRedirect: '/signup-success', // redirect to the secure profile section
                failureRedirect: '/signup', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }
        )
    );

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
            return res.redirect('/profile/select');
        }
        if (req.user.is_translator) {
            return res.redirect('/profilet');
        }
        if (req.user.is_customer) {
            return res.redirect('/profile');
        }
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
