module.exports = function (app, winston) {

    app.post('/plan', function (req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        console.log(input);
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
