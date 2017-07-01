/*
 * GET translators listing.
 */
var VideoChat = require('../app/models/videochat');
var Peer = require('../app/models/videochatpeer');
var moment = require('moment');

exports.index = function (req, res) {
    res.render('index', {moment: moment});
}

module.exports = function (app) {

    app.get('/translator/:id', isLoggedIn, function (req, res) {
        var id = req.params.id;
        req.getConnection(function (err, connection) {

            do_queries( connection, id, function(err, rows, rows2) {
                if(err)
                    report_error(err);
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


function do_queries( connection, id, callback ){
    var sql1 = "SELECT * FROM users," +
        " (SELECT t.id," +
        "     GROUP_CONCAT(concat(" +
        "         (select lang_desc from languages where lang_short=lang_from),'>')," +
        " (select lang_desc from languages where lang_short=lang_to)" +
        " ORDER BY lang_from SEPARATOR ' , ') as languages" +
        " FROM users t" +
        " LEFT JOIN translator_lang tl" +
        " ON t.id=tl.translator_id" +
        " GROUP BY t.id) AS JOINRESULT" +
        " WHERE users.id = JOINRESULT.id and  users.id = ?";

    //var sessionList = "";
    var sql2 = "select id,lang1,lang2,topic,duration,start_date,start_time " +
        "from translation_session where translator_id=? order by start_date,start_time";

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

            i=0;
            rows2.forEach(function (videoChat) {
                var peers;
                Peer.find({"videoChatId":videoChat.id}, function (err, peers) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    videoChat.peers=peers;
                    i++;
                    if(i==rows2.length){
                        callback(null, rows, rows2);
                        return;
                    }
                });

            });


        });
    });
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}



