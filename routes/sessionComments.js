/**
 * Created by semihkahya on 24.07.2017.
 */
var http = require('http');
var moment = require('moment');
var config = require('config');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt-nodejs');
var util = require("../app/util");

module.exports = function (app) {

    app.get('/session-comments', util.isLoggedIn, function (req, res, next) {
        var qstr = "select * from users where email =? ";

        req.getConnection(function (err, connection) {
            var query =
                connection.query(qstr, [req.user.email], function (err, user) {

                    if (err) {
                        console.log("Error Selecting : %s ", err);
                    }
                    if(user.is_translator){
                        return res.redirect('/dashboardt');
                    }else{

                        var sessionId = req.query.sessionID;
                        if(!sessionId){
                            return res.redirect('/dashboard');
                        }else{
                            var session = "select * from translation_session where id =? ";

                            connection.query(session, [sessionId], function (err, session) {
                                if (err) {
                                    console.log("Error Selecting : %s ", err);
                                }else {

                                    var tanslatorId = session[0].translator_id;
                                    var translator = "select * from users where id =? ";
                                    connection.query(translator, [tanslatorId], function (err, translator) {
                                        if (err) {
                                            console.log("Error Selecting : %s ", err);
                                        } else {
                                            res.render('session-comments.ejs', {
                                                user: req.user,
                                                sessionId: sessionId,
                                                session: session[0],
                                                translator:translator[0]
                                            });
                                        }
                                    });
                                }
                            });

                        }
                    };
                    // res == true
                    console.log(res);

                });
        });
    });

    app.post('/send-session-comments', function (req, res) {
        if(req.query.sessionId){
            req.getConnection(function (err, connection) {
                connection.query("select * from translation_session where id =? ", [req.query.sessionId], function (sessionErr, session) {
                    if (sessionErr) {
                        console.log("Error Selecting : %s ", sessionErr);
                        req.flash('message', 'Oops! something went wrong. Please try again');
                        res.redirect('/sessionComments');
                    }else{

                        var translatorId = session[0].translator_id;

                        var starAndComment = {
                            translation_session_id: translatorId,
                            user_id: req.query.userId,
                            star: req.body.star,
                            comment: req.body.comment
                        }

                        connection.query("INSERT INTO translation_session_star_and_comment set ? ", starAndComment, function (starCommentErr, starComment) {
                            if (starCommentErr) {
                                console.log("Error Selecting : %s ", starCommentErr);
                                req.flash('message', 'Oops! something went wrong. Please try again');
                                res.redirect('/sessionComments');
                            }
                        });

                        connection.query("select * from translator_sessions_mean_star where user_id =? ", [translatorId], function (starMeanErr, starMean) {
                            if (starMeanErr) {
                                console.log("Error Selecting : %s ", starMeanErr);
                                req.flash('message', 'Oops! something went wrong. Please try again');
                                res.redirect('/sessionComments');
                            }

                            if(starMean.length < 1){

                                var mean = {
                                    mean_star: req.body.star,
                                    star_count: 1,
                                    user_id:translatorId
                                };

                                connection.query("INSERT INTO translator_sessions_mean_star set ? ", mean, function (insertStarErr, insertStar) {
                                    if (insertStarErr) {
                                        console.log("Error Selecting : %s ", insertStarErr);
                                        req.flash('message', 'Oops! something went wrong. Please try again');
                                        res.redirect('/sessionComments');
                                    }
                                });

                            }else{
                                var mean = starMean[0];
                                mean.mean_star =((mean.mean_star * mean.star_count) + parseInt(req.body.star)) /( mean.star_count + 1);
                                mean.star_count = mean.star_count + 1;

                                connection.query("update translator_sessions_mean_star set mean_star =? , star_count=?  where user_id=? ", [mean.mean_star,mean.star_count,mean.user_id], function (updateMeanErr, updateMean) {
                                    if (updateMeanErr) {
                                        console.log("Error Selecting : %s ", updateMeanErr);
                                        res.end( "Oops! something went wrong. Please try again " );
                                    }
                                    req.flash('message', 'Your comment has been successfully sent!');
                                    res.redirect('/dashboard');
                                });
                            }


                        });
                    }

                });

            });
        }else{
            req.flash('message', 'Oops! something went wrong. Please try again');
            res.redirect('/sessionComments');
        }
    });

}