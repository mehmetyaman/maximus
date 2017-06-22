// load the things we need
var mongoose = require('mongoose');

var peerSchema = mongoose.Schema({
    _id           :  String,
    videoChatId   :  String,
    isActive      :  { type: String, default: 'A' },
    updatedAt     :  Date,
    $setOnInsert  :  {
        attendDate:  Date
    },
    leftDate   : Date
});

module.exports = mongoose.model('Peer', peerSchema);

