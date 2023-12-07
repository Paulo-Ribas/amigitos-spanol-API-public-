const mongoose = require('mongoose')
const videosConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/userVideos')
const roomConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/roomVideos')
const thumbnailConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/thumbnails')


module.exports = {
    rommConnection: roomConnection,
    videosConnection: videosConnection,
    thumbnails: thumbnailConnection
}