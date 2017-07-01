var VideoChat = require('../app/models/videochat');
var Peer = require('../app/models/videochatpeer');
var moment = require('moment');

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

    app.post('/users/add', function (req, res) {
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

            var query = connection.query('SELECT * FROM users ', function (err, rows) {

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

            var query = connection.query('SELECT * FROM users WHERE id = ?', [id], function (err, rows) {

                if (err)
                    console.log("Error Selecting : %s ", err);

                res.render('user/edit_user', {page_title: "User Edit", data: rows});


            });
        });
    });

    app.get('/user/:id', isLoggedIn, function (req, res) {
        var userid = req.params.id;
        req.getConnection(function (err, connection) {

            do_queries(connection, userid, function (err, rows2) {
                if (err) {
                    console.log("Error do_queries : %s ", err);
                    return;
                } else
                    res.render('user/userDashboard', {
                        page_title: "User Dashboard page",
                        data: rows2[0],
                        lists: rows2,
                        user: req.user,
                        moment: moment,
                    });
            });

        });
    });

};

function do_queries(connection, userid, callback) {
    var sql2 = " select u.*,ts.id,lang1,lang2,topic,duration,start_date,start_time " +
        " from user u,translation_session ts,  translation_session_users  tsu" +
        " where ts.id=tsu.session_id" +
        " and tsu.user_id=u.id" +
        " and tsu.user_id=?" +
        " order by start_date,start_time";

    var query2 = connection.query(sql2, [userid], function (err2, rows2) {
        if (err2) {
            callback(err2);
            return;
        }

        i = 0;
        rows2.forEach(function (videoChat) {
            var peers;
            Peer.find({"videoChatId": videoChat.id}, function (err, peers) {
                if (err) {
                    callback(err);
                    return;
                }
                videoChat.peers = peers;
                i++;
                if (i == rows2.length) {
                    callback(null, rows2);
                    return;
                }
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


