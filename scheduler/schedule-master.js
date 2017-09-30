/**
 * Created by mehmetyaman on 21.06.2017.
 */
var schedule = require('node-schedule')
var mysql = require('mysql')

module.exports = function (server) {
    var con = mysql.createConnection({
        'host': 'localhost',
        'user': 'root',
        'password': 'root',
        'port': 3306,
        'database': 'maximus',
        'multipleStatements': 'true'
    })

    con.connect(function (err) {
        if (err) throw err
        console.log('Connected!')
    })

    var event = schedule.scheduleJob('*/1 * * * *', function () {
        console.log('This runs every 1 minute')
    });

    var j = schedule.scheduleJob('1 * * * * *', function(){
        console.log('The answer to life, the universe, and everything!');
    });

    var io = require('socket.io').listen(server)
    io.on('connection', function (socket) {
        console.log('new connection established')

        socket.emit('announcements', {message: 'A new user has joined!'})
        var event = schedule.scheduleJob('*/1 * * * *', function () {
            console.log('This runs every 1 minute')

            con.query(
                'SELECT ts.*, tsd.id as demand_id FROM translation_session ts LEFT JOIN translation_session_demands' +
                ' tsd ON tsd.translation_session_id = ts.id where ts.is_pushed = 0 ',
                function (err, reqs) {
                    if (!err) {
                        reqs.forEach(function (sessionReq) {
                            console.log('this is not pushed yet: ' + sessionReq.id)

                            con.query(
                                'update  translation_session set is_pushed = 1 where id=? ',
                                sessionReq.id, function (err2, upreqs) {
                                    if (err2) throw err2
                                    if (!err2) {
                                        socket.emit('newsessionrequest', sessionReq)
                                        console.log('updated as pushed: ' + sessionReq.id)
                                    }
                                })
                        })
                    } else {
                        console.log('Error while performing Query.')
                    }
                })
        })
    })
}
