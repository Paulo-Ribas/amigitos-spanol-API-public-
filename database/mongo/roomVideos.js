const mongoose = require('mongoose')

const roomVideos = new mongoose.Schema({
    roomName: String,
    url: String,
    filesVideos: Array,
    userAdm: Number,
    pass: Boolean,
    password: String,
    members: Array,
    banneds: Array,
    adms: Array,
    isMuted: Array,
    membersAllowedChoice: Array,
    maxMembers: Number,
    type: String,
    rendered: Boolean,
    rulesType: Number,


})

module.exports = roomVideos