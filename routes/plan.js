module.exports = function (app, winston) {

    app.post('/plan', isLoggedIn, function (req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        req.getConnection(function (err, connection) {

            var data = {
                lang1: getLang(input.lang1),
                lang2: getLang(input.lang2),
                start_date: new Date(input.plandate),
                end_date: new Date(input.plandate),
                duration: input.interval
            }
            if (err) {
                console.log("Error inserting : %s ", err);
                res.status(500).json({error: err});
            }
            var query2 = connection.query("INSERT INTO `translation_session` set ?", [data], function (err2, rows2) {

                if (err2) {
                    console.log("Error inserting : %s ", err2);
                    res.status(500).json({error: err});
                }
            });

            res.send(200);
        });
    })
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function getLang(param) {

    if ("Turkish" == param) {
        return "tr";
    } else if ("English" == param) {
        return "en";
    } else if ("Japanese" == param) {
        return "jp";
    }

}
