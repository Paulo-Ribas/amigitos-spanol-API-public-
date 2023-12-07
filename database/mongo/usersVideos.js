const mongoose = require('mongoose')

const userVideos = new mongoose.Schema({
    userID: Number,
    fileName: String,
    location: String,
    cloudFront: String,
    file: String,
    thumbnailName: String,
    thumbnailLocation: String,
})

module.exports = userVideos