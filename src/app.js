const express = require('express')
const app = express()
const router = require('../routers/routers')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const path = require('path')
require('dotenv').config()

app.use(express.urlencoded({extended: true, limit: '50mb'}))
app.use(express.json({limit: '50mb'}))
app.use(cors())

app.use('/', router)

module.exports = app