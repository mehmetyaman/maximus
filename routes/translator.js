var VideoChat = require('../app/models/videochat');
var Peer = require('../app/models/videochatpeer');
var moment = require('moment');

exports.index = function (req, res) {
    res.render('index', {moment: moment});
}

module.exports = function (app) {

    // DASHBOARD SECTION =========================
    app.get('/dashboardt', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {
            var query = connection.query('select * from languages', function (err, langs) {

                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                req.getConnection(function (err1, connection) {
                    var sql = 'select * from translation_session ts  ' +
                        'where (ts.translator_id = ? or ts.translator_id = 0 ) and ' +
                        'exists ( select * from translator_lang tl where (tl.translator_id=?) ' +
                        'and ((lang1=lang_from and lang2=lang_to) or (lang1=lang_to and lang2=lang_from)))';
                    var query = connection.query(sql, [req.user.id, req.user.id], function (err1, translationRequests) {

                        if (err1) {
                            console.log("Error Selecting : %s ", err1);
                        }

                        req.getConnection(function (err3, connection) {
                            var query = connection.query('select * from categories', function (err3, categories) {
                                var appropriateRequests = translationRequests;
                                if (appropriateRequests.length > 0) {
                                    var sqlForDemands = "select * from translation_session_demands where user_id=?";
                                    var query = connection.query(sqlForDemands, req.user.id, function (errDemands, demands) {
                                        if (demands.length > 0) {
                                            appropriateRequests.forEach(function (request) {
                                                demands.forEach(function (demand) {
                                                    if (request.translator_id == 0 && request.id == demand.translation_session_id) {
                                                        request.is_demanded = true;
                                                    }
                                                })
                                            });
                                        }
                                        res.render('translator/dashboardt.ejs', {
                                            user: req.user,
                                            langs: langs,
                                            lists: appropriateRequests,
                                            cats: categories,
                                            moment: moment
                                        });
                                    });
                                } else {
                                    res.render('translator/dashboardt.ejs', {
                                        user: req.user,
                                        langs: langs,
                                        lists: appropriateRequests,
                                        cats: categories,
                                        moment: moment
                                    });
                                }
                            })
                        })
                    });
                });
            });
        });
    });

    app.post('/assignSession/:id', isLoggedIn, function (req, res) {
        var id = req.params.id;

        req.getConnection(function (err, connection) {
            connection.query("UPDATE translation_session set translator_id = ? WHERE id = ? ", [req.user.id, id], function (err, rows) {

                if (err)
                    console.log("Error Updating : %s ", err);

                res.redirect('dashboardt');

            });

        });
    });

    app.post('/assign/translator/:translator_id/session/:session_id', isLoggedIn, function (req, res) {
        var translator_id = req.params.translator_id;
        var session_id = req.params.session_id;
        req.getConnection(function (err, connection) {
            connection.query("UPDATE translation_session set translator_id = ? WHERE id = ? ", [translator_id, session_id], function (err, rows) {

                if (err)
                    console.log("Error Updating : %s ", err);

                res.redirect('dashboardt');

            });

        });
    });

    app.post('/demand/:id', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {
            connection.query("insert into translation_session_demands (user_id, translation_session_id) values (?," +
                " ?) ", [req.user.id, req.params.id], function (err, rows) {

                if (err) {
                    console.log("Error inserting : %s ", err);
                }

                res.redirect('dashboardt');

            });

        });
    });

    app.get('/translator/:id', isLoggedIn, function (req, res) {
        var id = req.params.id;
        req.getConnection(function (err, connection) {

            do_queries(connection, id, function (err, rows, rows2) {
                if (err)
                    console.log(err);
                else
                    res.render('translator/translator', {
                        page_title: "Translator page",
                        data: rows,
                        lists: rows2,
                        user: req.user,
                        moment: moment,
                    });
            });
        });
    });
};


function do_queries(connection, id, callback) {
    var sql1 = "SELECT * FROM users," +
        " (SELECT t.id," +
        "     GROUP_CONCAT(concat(" +
        "         (select lang_desc from languages where lang_short=lang_from),'>')," +
        " (select lang_desc from languages where lang_short=lang_to)" +
        " ORDER BY lang_from SEPARATOR ' , ') as languages" +
        " FROM users t" +
        " LEFT JOIN translator_lang tl" +
        " ON t.id=tl.translator_id " +
        " GROUP BY t.id) AS JOINRESULT" +
        " WHERE users.id = JOINRESULT.id and  users.id = ?";

    //var sessionList = "";
    var sql2 = "select * from translation_session where (translator_id=? or translator_id = 0) " +
        "order by start_date,start_time";

    var query = connection.query(sql1, [id], function (err, rows) {
        if (err) {
            callback(err);
            return;
        }
        var query2 = connection.query(sql2, [id], function (err2, rows2) {
            if (err2) {
                callback(err2);
                return;
            }

            i = 0;
            if (rows2.length > 0) {
                rows2.forEach(function (videoChat) {
                    var peers;
                    Peer.find({"videoChatId": videoChat.id}, function (err, peers) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        videoChat.peers = peers;
                        i++;
                        if (i == rows2.length) {
                            callback(null, rows, rows2);
                            return;
                        }
                    });
                });
            } else {
                callback(null, [], []);
            }

        });
    });
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}



