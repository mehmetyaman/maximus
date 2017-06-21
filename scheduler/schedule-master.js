/**
 * Created by mehmetyaman on 21.06.2017.
 */
var winston = require('winston');
var schedule = require('node-schedule');

var scheduler = function () {

    var _self = this;

    _self.init = function () {
        console.log("init Schedular");
        var event = schedule.scheduleJob("*/1 * * * *", function () {
            console.log('This runs every 1 minute');
        });
    }

}

module.exports = new scheduler();
