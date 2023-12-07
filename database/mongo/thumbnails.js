const mongoose = require('mongoose')
const thumbnails = new mongoose.Schema({
    name: String,
    location: String
})

module.exports = thumbnails