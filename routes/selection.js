
module.exports = function (app) {

    app.get('/selection/session/:id', function (req, res, next) {
        var session_id = req.params.id;

        req.getConnection(function (err3, connection) {
            connection.query('select  u.id as user_id, u.name as name, u.surname as surname, ts.id as' +
                ' session_id, u.picture_url as picture_url from' +
                ' translation_session ts, translation_session_users tsu, translation_session_demands tsd , users u where ' +
                'ts.id = tsu.translation_session_id and ' +
                'tsu.user_id = ? and ' +
                'tsd.translation_session_id=ts.id and ' +
                'tsd.user_id = u.id and ts.id=? ', [req.user.id, session_id], function (err3, demandedTranslators) {
                res.render('selection.ejs', {
                    user: req.user,
                    demandedTranslators: demandedTranslators
                });
            });
        })
    });

    app.get('/selection/session/:id/translator/:translator_id', function (req, res, next) {
        var session_id = req.params.id;
        var translator_id = req.params.translator_id;

        var ts = {
            translation_session_id: session_id,
            user_id: translator_id
        };

        req.getConnection(function (err3, connection) {
            connection.query("INSERT INTO translation_session_users set ? ", ts, function (err6, rows6) {
                    if (err6) {
                        console.log("Error inserting : %s ", err6);
                        res.status(500).json({error: err6});
                    }

                    connection.query('update  translation_session set translator_id=?' +
                        ' where id=? ', [translator_id, session_id], function (err6, rows6) {
                        if (err6) {
                            connection.rollback(function () {
                                throw err;
                            });
                            console.log("Error inserting : %s ", err6);
                            res.status(500).json({error: err6});
                        }

                        res.redirect('/dashboard');
                    });
                }
            );
        });
    });

}
