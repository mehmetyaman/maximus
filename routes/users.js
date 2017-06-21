module.exports = function (app) {

    app.post('/users/edit/:id', isLoggedIn, function (req, res) {
        var input = JSON.parse(JSON.stringify(req.body));
        var id = req.params.id;

        req.getConnection(function (err, connection) {

            var data = {
                name: input.name,
                address: input.address,
                email: input.email,
                phone: input.phone
            };

            connection.query("UPDATE user set ? WHERE id = ? ", [data, id], function (err, rows) {

                if (err)
                    console.log("Error Updating : %s ", err);

                res.redirect('users');

            });

        });
    });

    app.post('/users/add', isLoggedIn, function (req, res) {
        var input = JSON.parse(JSON.stringify(req.body));

        req.getConnection(function (err, connection) {

            var data = {
                name: input.name,
                address: input.address,
                email: input.email,
                phone: input.phone,
                user_type: 'SIMU_TRANSLATER',
                time_zone: '+2 GMT',
                country_code: 'EN'
            };

            var query = connection.query("INSERT INTO user set ? ", data, function (err, rows) {

                if (err)
                    console.log("Error inserting : %s ", err);

                res.redirect('users');

            });
        });
    });

    app.get('/users', isLoggedIn, function (req, res) {
        req.getConnection(function (err, connection) {

            var query = connection.query('SELECT * FROM user', function (err, rows) {

                if (err) {
                    console.log("Error Selecting : %s ", err);
                }

                res.render('user/users', {page_title: "Users List", data: rows});

            });
        });

    });

    app.get('/users/add', function (req, res) {
        res.render('user/add_user', {page_title: "Add user"});
    });

    app.get('/users/delete/:id', isLoggedIn, function (req, res) {

        var id = req.params.id;

        req.getConnection(function (err, connection) {

            connection.query("DELETE FROM user  WHERE id = ? ", [id], function (err, rows) {

                if (err)
                    console.log("Error deleting : %s ", err);

                res.redirect('users');

            });

        });
    });

    app.get('/users/edit/:id', isLoggedIn, function (req, res) {
        var id = req.params.id;

        req.getConnection(function (err, connection) {

            var query = connection.query('SELECT * FROM user WHERE id = ?', [id], function (err, rows) {

                if (err)
                    console.log("Error Selecting : %s ", err);

                res.render('user/edit_user', {page_title: "User Edit", data: rows});


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


