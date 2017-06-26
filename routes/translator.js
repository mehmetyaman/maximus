/*
 * GET translators listing.
 */

var moment = require('moment');
exports.index = function (req, res) {
    res.render('index', {moment: moment});
}

module.exports = function (app) {

    app.get('/translator/:id', isLoggedIn, function (req, res) {
        var id = req.params.id;
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
                " WHERE translators.id = JOINRESULT.id and  translators.id = ?";


            var query = connection.query(sql, [id], function (err, rows) {

                if (err) {
                    console.log(" Query 1 Error Selecting : %s ", err);
                }
                //var sessionList = "";
                var sql2 = "select id,lang1,lang2,topic,duration,start_date,start_time from maxsimus.translation_session where translator_id=? order by start_date,start_time";

                var query2 = connection.query(sql2, [id], function (err2, rows2) {
                    if (err) {
                        console.log("Query 2 Error Selecting : %s ", err2);
                    }

                    res.render('translator/translator', {
                        page_title: "Translator page",
                        data: rows,
                        lists: rows2,
                        moment: moment
                    });
                });
            });
        });
    });
};



// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}



