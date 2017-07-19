var randomstring = require("randomstring");

module.exports = function (app, winston, emailServer) {

    app.get('/plan/:userId', isLoggedIn, function (req, res, next) {
        var userId = req.params.userId;
        req.getConnection(function (err, connection) {
            var query = connection.query('select ts.* from translation_session_users tu, translation_session ts' +
                '  where tu.user_id = ? and tu.id = ts.id ', userId, function (err, rows) {

                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                res.status(200).json(rows);
            });
        });
    });

    app.get('/plan-assign', isLoggedIn, function (req, res, next) {
        var qstr = "select * from translation_session_invitations where email =? and invitation_token=? and" +
            " translation_session_id =?";
        req.getConnection(function (err, connection) {
            var query =
                connection.query(qstr, [req.user.email, req.query.invitation_token, req.query.sessionId], function (err, invitations) {

                    if (err) {
                        console.log("Error Selecting : %s ", err);
                    }
                    if(invitations.length>0){
                        var data = {
                            translation_session_id: req.query.sessionId,
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

                            if(req.user.is_customer){
                                res.redirect("/profile");
                            } else if(req.user.is_translator){
                                res.redirect("/profilet");
                            }
                        });
                    };
                    // res == true
                    console.log(res);

                });
        });
    })

    // add-participant
    app.post('/add-participant', isLoggedIn, function (req, res, next) {
        var participant = req.body.participantName;
        var sessionId = req.body.sessionId;
        // generate a link for participant and send email
        var token = randomstring.generate({
            length: 32
        });

        var data = {
            invitation_token: token,
            email: participant,
            translation_session_id: sessionId
        }
        req.getConnection(function (err, connection) {
            var query2 = connection.query("INSERT INTO `translation_session_invitations` set ?", [data], function (err2, rows2) {

                if (err2) {
                    connection.rollback(function () {
                        throw err;
                    });
                    console.log("Error inserting : %s ", err2);
                    res.status(500).json({error: err2});
                }

                emailServer.send({
                    text: "Linpret session invitation link is " + req.protocol + '://' + req.get('host') + '/plan-assign?sessionId=' + sessionId + '&invitation_token=' + token,
                    from: "linpretinfo@gmail.com",
                    to: participant,
                    cc: "kaplanerbil@gmail.com",
                    subject: "Linpret Translation Meeting Invitation "
                }, function (err, message) {
                    if (err) {
                        res.send(500)
                    }
                    console.log(err || message);
                });

                res.send(200);
            });
        })
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
                category_id: input.catval,
                translator_id: 0,
                is_paid: 0
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
                    translation_session_id: sessionId,
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

