// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var config = require('config');

var connection = mysql.createConnection(config.get('mysql'));

//connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, username, password, done) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                var isLinkedincycle = false;
                if (req.body.linkedincycle) {
                    isLinkedincycle = true;
                }
                connection.query("SELECT * FROM users WHERE email = ? ", [username], function (err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        if (isLinkedincycle) {
                            var user = rows[0];
                            user.password = bcrypt.hashSync(password, null, null);
                            var updatequery = "update users set password =? where email=?";

                            connection.query(updatequery, [bcrypt.hashSync(user.password, null, null), username], function (err, rows) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, user);
                            });
                        } else {
                            return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                        }
                    } else {
                        // if there is no user with that username
                        // create the user
                        var newUserMysql = {
                            username: username,
                            password: bcrypt.hashSync(password, null, null),
                            is_customer: req.query.customer ? 1 : 0,
                            is_translator: !req.query.customer ? 1 : 0,
                            name: req.body.name,
                            surname: req.body.surname
                        };

                        var insertQuery = "INSERT INTO users (email, password, is_customer, is_translator, name," +
                            " surname)" +
                            " values" +
                            " (?,?,?,?,?,?) ";

                        connection.query(insertQuery, [newUserMysql.username, newUserMysql.password,
                            newUserMysql.is_customer, newUserMysql.is_translator, newUserMysql.name, newUserMysql.surname], function (err, rows) {
                            if (err) {
                                return done(err);
                            }

                            newUserMysql.id = rows.insertId;

                            return done(null, newUserMysql);
                        });
                    }
                });
            })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, username, password, done) { // callback with email and password from our form
                connection.query("SELECT * FROM users WHERE email = ?", [username], function (err, rows) {
                    if (err) {
                        return done(err);
                    }
                    if (!rows.length) {
                        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                    }

                    // if the user is found but the password is wrong
                    if (!bcrypt.compareSync(password, rows[0].password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, rows[0]);
                });
            })
    );

// =========================================================================
// Linkedin ================================================================
// =========================================================================
    passport.use(new LinkedInStrategy({
        clientID: "86jkoxygnghvrf",
        clientSecret: "mpkg3fLKSMnQawzE",
        callbackURL: "/auth/linkedin/callback",
        scope: ['r_emailaddress', 'r_basicprofile'],
        passReqToCallback: true
    }, function (req, accessToken, refreshToken, profile, done) {
        req.session.accessToken = accessToken;
        req.session.linkedinprofile = profile._json;
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // To keep the example simple, the user's LinkedIn profile is returned to
            // represent the logged-in user. In a typical application, you would want
            // to associate the LinkedIn account with a user record in your database,
            // and return that user instead.
            connection.query("SELECT * FROM users WHERE email = ? ", profile.emails[0].value, function (err, rows) {
                if (err) {
                    return done(err);
                }
                if (!rows.length) {
                    // new user case
                    var user = {
                        name: profile._json.firstName,
                        surname: profile._json.lastName,
                        email: profile._json.emailAddress,
                        picture_url: profile._json.pictureUrl,
                        country_code: profile._json.location.country.code,
                        password: bcrypt.hashSync(1, null, null),
                        is_linkedin_user: 1,
                        linkedin_id: profile._json.id
                    }

                    var query = connection.query("INSERT INTO users set ? ", user, function (err1, results, rows1) {
                        if (err1) {
                            done(err);
                        }

                        done(null, user);
                    });

                } else {
                    var user = {
                        name: profile._json.firstName,
                        surname: profile._json.lastName,
                        email: profile._json.emailAddress,
                        picture_url: profile._json.pictureUrl,
                        country_code: profile._json.location.country.code,
                        is_linkedin_user: 1,
                        linkedin_id: profile._json.id
                    }

                    var query = connection.query("update users set ? where linkedin_id=? ", [user, user.linkedin_id], function (err1, results, rows2) {
                        if (err1) {
                            done(err);
                        }

                        // all is well, return successful user
                        done(null, user);
                    });
                }
            });
        });
    }));

// =========================================================================
// FACEBOOK ================================================================
// =========================================================================
    var fbStrategy = config.get('facebookAuth');
    fbStrategy.passReqToCallback = true;  // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    passport.use(new FacebookStrategy(fbStrategy,
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({'facebook.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }
            });

        }));

// =========================================================================
// TWITTER =================================================================
// =========================================================================
    passport.use(new TwitterStrategy({

            consumerKey: config.get('twitterAuth.consumerKey'),
            consumerSecret: config.get('twitterAuth.consumerSecret'),
            callbackURL: config.get('twitterAuth.callbackURL'),
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, tokenSecret, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({'twitter.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token) {
                                user.twitter.token = token;
                                user.twitter.username = profile.username;
                                user.twitter.displayName = profile.displayName;

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.twitter.id = profile.id;
                            newUser.twitter.token = token;
                            newUser.twitter.username = profile.username;
                            newUser.twitter.displayName = profile.displayName;

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }

            });

        }));

// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
    passport.use(new GoogleStrategy({

            clientID: config.get('googleAuth.clientID'),
            clientSecret: config.get('googleAuth.clientSecret'),
            callbackURL: config.get('googleAuth.callbackURL'),
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({'google.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.google.token) {
                                user.google.token = token;
                                user.google.name = profile.displayName;
                                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                                user.save(function (err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {
                            var newUser = new User();

                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.name = profile.displayName;
                            newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                            newUser.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.name = profile.displayName;
                    user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }
            });
        }));
};

