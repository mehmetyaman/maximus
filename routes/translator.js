/*
 * GET translators listing.
 */
module.exports = function (app) {


    // show the home page (will also have our login links)
    // app.get('/translators', translators.list);
    app.get('/translator/:id', function (req, res) {
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

            var query = connection.query(sql, [id],  function (err, rows) {

                if (err){
                    console.log("Error Selecting : %s ", err);
                }

                res.render('translator/translator', {page_title: "Translator page", data: rows});


            });

        });
    });


};





