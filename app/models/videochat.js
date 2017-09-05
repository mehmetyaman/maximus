// load the things we need
var mongoose = require('mongoose')
// var Peer = require('../models/videochatpeer')

// define the schema for videoChat model
var videoChatSchema = mongoose.Schema({
  _id: String,
  trans_lang: String,
  updatedAt: Date,
  userLimit: Number,
  createdAt: Date,
  peers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Peer'}]
})

// create the model for videoChat and expose it to our app
module.exports = mongoose.model('VideoChat', videoChatSchema)
