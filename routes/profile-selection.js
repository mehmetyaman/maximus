module.exports = function (app) {

    app.get('/profile/select', isLoggedIn, function (req, res, next) {
        res.render('profile-selection.ejs');
    });

    app.post('/profile/select', isLoggedIn, function (req, res, next) {
        var selectedProfile = req.body.selectedProfile;
        var linkedinprofile = req.session.linkedinprofile;

        //  is_customer | is_translator | is_linkedin_user
        req.getConnection(function (err, connection) {
            var query = connection.query("update users set is_translator=?,is_customer=?, is_linkedin_user=? where" +
                " linkedin_id=? ",
                [selectedProfile === "atranslator" ? 1 : 0, selectedProfile === "acustomer" ? 1 : 0, 1,
                    linkedinprofile.id], function (err, results, rows) {
                    if (err) {
                        console.log("Error Updating : %s ", err);
                        res.send({redirect: '/'});
                    }

                    if (selectedProfile === "atranslator") {
                        // cont as a translator
                        res.send({redirect: '/profilet'});
                    } else if (selectedProfile === "acustomer") {
                        // cont as a customer
                        res.send({redirect: '/profile'});
                    }

                });
        });
    });
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

