
var VideoChat = require('../app/models/videochat');
var Peer = require('../app/models/videochatpeer');
var moment = require('moment');

exports.index = function (req, res) {
    res.render('index', {moment: moment});
}

module.exports = function (app) {

    // PROFILE SECTION =========================
    app.get('/profilet', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {
            var query = connection.query('select * from languages', function (err, rows) {

                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                req.getConnection(function (err1, connection) {
                    var sql = 'select * from translation_session ts ' +
                        'where (ts.translator_id = ? or ts.translator_id = 0 ) ' +
                        'and exists (select * from translator_lang tl  ' +
                        'where  (tl.translator_id=ts.translator_id  or ts.translator_id = 0 ) ' +
                        'and ((lang1=lang_from or lang1=lang_to) and (lang2=lang_from or lang2=lang_to) ))';
                    var query = connection.query(sql, req.user.id, function (err1, rows2) {

                        if (err1) {
                            console.log("Error Selecting : %s ", err1);
                        }

                        req.getConnection(function (err3, connection) {
                            var query = connection.query('select * from categories', function (err3, rows3) {
                                res.render('translator/profilet.ejs', {
                                    user: req.user,
                                    langs: rows,
                                    lists: rows2,
                                    cats: rows3,
                                    moment: moment
                                });
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
            connection.query("UPDATE translation_session set translator_id = ? WHERE id=? ", [req.user.id,id], function (err, rows) {

                if (err)
                    console.log("Error Updating : %s ", err);

                res.redirect('profilet');

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



