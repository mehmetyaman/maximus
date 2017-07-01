/*
 * GET translators listing.
 */
module.exports = function (app) {

    app.post('/translators/edit/:id', isLoggedIn, function (req, res) {

        var input = JSON.parse(JSON.stringify(req.body));
        var id = req.params.id;

        req.getConnection(function (err, connection) {

            var data = {
                name: input.name,
                surname: input.surname,
                email: input.email
            };

            connection.query("UPDATE users set ? WHERE id = ? ", [data, id], function (err, rows) {
                if (err) {
                    console.log("Error Updating users : %s ", err);
                } else {
                    connection.query("DELETE FROM translator_lang  WHERE translator_id = ? ", [id], function (err2, rows2) {
                        if (err2) {
                            console.log("Error deleting translator_lang : %s ", err2);
                        } else {
                            var values = [];
                            if (input.langFrom0 != "-1" && input.langTo0 != "-1") {
                                values.push([id, input.langFrom0, input.langTo0]);
                            }
                            if (input.langFrom1 != "-1" && input.langTo1 != "-1") {
                                values.push([id, input.langFrom1, input.langTo1]);
                            }
                            if (input.langFrom2 != "-1" && input.langTo2 != "-1") {
                                values.push([id, input.langFrom2, input.langTo2]);
                            }
                            var query2 = connection.query("INSERT INTO translator_lang (translator_id, lang_from, lang_to) values ? ", [values], function (err3, rows3) {
                                if (err3)
                                    console.log("Error inserting : %s ", err3);
                            });
                        }
                    });
                }

                res.redirect('translators');

            });

        });
    });

    //app.post('/translators/add', translators.save);
    app.post('/translators/add', isLoggedIn, function (req, res) {

        var input = JSON.parse(JSON.stringify(req.body));

        req.getConnection(function (err, connection) {

            var data = {
                name: input.name,
                surname: input.surname,
                email: input.email
            };

            var query = connection.query("INSERT INTO users set ? ", data, function (err, results, rows) {

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

                        if (err2)
                            console.log("Error inserting : %s ", err2);

                    });

                }
                res.redirect('translators');

            });

            // console.log(query.sql); get raw query

        });
    });

    app.post('/translators/add', isLoggedIn, function (req, res) {

        var input = JSON.parse(JSON.stringify(req.body));
        var id = req.params.id;

        req.getConnection(function (err, connection) {

            var data = {
                name: input.name,
                surname: input.surname,
                email: input.email
            };

            connection.query("UPDATE users set ? WHERE id = ? ", [data, id], function (err, rows) {

                if (err) {
                    console.log("Error Updating users : %s ", err);
                } else {
                    connection.query("DELETE FROM translator_lang  WHERE translator_id = ? ", [id], function (err2, rows2) {
                        if (err2) {
                            console.log("Error deleting translator_lang : %s ", err2);
                        } else {
                            var values = [];
                            if (input.langFrom0 != "-1" && input.langTo0 != "-1") {
                                values.push([id, input.langFrom0, input.langTo0]);
                            }
                            if (input.langFrom1 != "-1" && input.langTo1 != "-1") {
                                values.push([id, input.langFrom1, input.langTo1]);
                            }
                            if (input.langFrom2 != "-1" && input.langTo2 != "-1") {
                                values.push([id, input.langFrom2, input.langTo2]);
                            }

                            var query2 = connection.query("INSERT INTO translator_lang (translator_id, lang_from, lang_to) values ? ", [values], function (err3, rows3) {

                                if (err3)
                                    console.log("Error inserting : %s ", err3);

                            });
                        }

                    });

                }

                res.redirect('translators');

            });

        });
    });

    app.get('/translators/edit/:id', isLoggedIn, function (req, res) {

        var id = req.params.id;

        req.getConnection(function (err, connection) {

            var sql = "SELECT * FROM users,(SELECT t.id, " +
                "GROUP_CONCAT(concat(lang_from,'>'),lang_to ORDER BY lang_from SEPARATOR ',') as languages " +
                "FROM users t LEFT JOIN translator_lang tl ON t.id=tl.translator_id GROUP BY t.id) AS JOINRESULT " +
                "WHERE users.id = JOINRESULT.id and  users.id = ?";

            var query = connection.query(sql, [id], function (err, rows) {
                console.log(" Selecting : %s ", rows);
                if (err) {
                    console.log("Error Selecting : %s ", err);
                } else {
                    var query = connection.query('select * from languages', function (err2, rows2) {
                        console.log(" Selecting : %s ", rows2);
                        if (err2)
                            console.log("Error Selecting Languages : %s ", err2);

                        res.render('translator/edit_translator', {
                            page_title: "Edit Translator - Node.js",
                            dataLang: rows2,
                            data: rows
                        });

                    });
                }

            });

            //console.log(query.sql);
        });
    });

    // show the home page (will also have our login links)
    // app.get('/translators', translators.list);
    app.get('/translators', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {

            var sql = "SELECT * FROM users," +
                " (SELECT t.id," +
                "     GROUP_CONCAT(concat(" +
                "         (select lang_desc from languages where lang_short=lang_from),'>')," +
                " (select lang_desc from languages where lang_short=lang_to)" +
                " ORDER BY lang_from SEPARATOR ' , ') as languages" +
                " FROM users t" +
                " LEFT JOIN translator_lang tl" +
                " ON t.id=tl.translator_id" +
                " GROUP BY t.id) AS JOINRESULT" +
                " WHERE users.id = JOINRESULT.id";

            var query = connection.query(sql, function (err, rows) {

                if (err)
                    console.log("Error Selecting : %s ", err);

                res.render('translator/translators', {page_title: "Translators List", data: rows});


            });

        });
    });

    // app.get('/translators/add', translators.add);
    app.get('/translators/add', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {

            var query = connection.query('select * from languages', function (err, rows) {

                if (err)
                    console.log("Error Selecting : %s ", err);

                res.render('translator/add_translator', {page_title: "Add Translator - Node.js", dataLang: rows});

            });

        });
    });


    app.get('/translators/delete/:id', isLoggedIn, function (req, res) {

        var id = req.params.id;

        req.getConnection(function (err, connection) {

            connection.query("DELETE FROM translator_lang  WHERE translator_id = ? ", [id], function (err, rows) {

                if (err)
                    console.log("Error deleting translator_lang : %s ", err);

            });

            connection.query("DELETE FROM users  WHERE id = ? ", [id], function (err2, rows2) {
                if (err2)
                    console.log("Error deleting translator : %s ", err2);
            });

            res.redirect('translators');

        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
