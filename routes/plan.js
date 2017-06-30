module.exports = function (app, winston) {

    app.get('/plan/:userId', isLoggedIn, function (req, res, next) {
        var userId = req.params.userId;
        req.getConnection(function (err, connection) {
            var query = connection.query('select ts.* from translation_session_users tu, translation_session ts' +
                '  where tu.user_id = ? and tu.id = ts.id ', userId, function (err, rows) {

                if (err){
                    console.log("Error Selecting : %s ", err);
                }
                res.status(200).json(rows);
            });
        });
    });
    
    app.post('/plan', isLoggedIn, function (req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        req.getConnection(function (err, connection) {

            var data = {
                lang1: input.lang1,
                lang2: input.lang2,
                start_date: new Date(input.plandate),
                end_date: new Date(input.plandate),
                duration: input.interval,
                description: input.desc,
                catval:input.catval
            }
            if (err) {
                connection.rollback(function () {
                    throw err;
                });
                console.log("Error inserting : %s ", err);
                res.status(500).json({error: err});
            }
            var query2 = connection.query("INSERT INTO `translation_session` set ?", [data], function (err2, rows2) {

                if (err2) {
                    connection.rollback(function () {
                        throw err;
                    });
                    console.log("Error inserting : %s ", err2);
                    res.status(500).json({error: err2});
                }
                var sessionId = rows2.insertId;
                var data = {
                    id: sessionId,
                    user_id: req.user.id
                }
                var query3 = connection.query("INSERT INTO `translation_session_users` set ?", [data], function (err3, rows3) {
                    if (err3) {
                        connection.rollback(function () {
                            throw err;
                        });
                        console.log("Error inserting : %s ", err3);
                        res.status(500).json({error: err3});
                    }
                });

                res.send(200);
            });
        })
    })
}
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

