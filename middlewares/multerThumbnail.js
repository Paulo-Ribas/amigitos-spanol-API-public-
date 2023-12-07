const multer = require('multer')
const path = require('path')
const aws = require('@aws-sdk/client-s3')
const multerS3 = require('multer-s3')

let storage = {
    local: multer.diskStorage({
        destination: function (req, file, cb) {
            let dir = path.resolve(__dirname, '../', 'attachments')
            req.body.dir = dir
            cb(null, dir)
        },
        filename: function (req, file, cb) {
            const hash = Date.now() + '-' + parseInt(Math.random() * (100000 + 100000) - 100000)
            const thumbName = file.originalname.split('.')[0]
            const finalName = file.fieldname + '-' + thumbName + '-' + hash + '.mp4'
            const originalName = {
                file,
                finalName
            }
            req.body.datesImage = originalName
            cb(null, finalName)

        }
    }),
    storageS3: multerS3({
        s3: new aws.S3(),
        bucket: 'thumbnailamigitospanol',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: function (req, file, cb) {
            const hash = Date.now() + '-' + parseInt(Math.random() * (5000 + 5000) - 5000)
            const imgName = file.originalname.split('.')[0]
            const finalName = file.fieldname + '-' + imgName + '-' + hash + '.png'
            const originalName = {
                file,
                finalName
            }
            req.body.thumbnail = originalName
            return cb(null, finalName)
        }
    })
}
const multerSingleVideo = multer({
    dest: path.resolve(__dirname, '..', '/attachments/'),
    storage: storage.storageS3,
    limits: {
        fileSize: 780 * 1024 * 1024,

    },
    fileFilter(req, file, cb) {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg']
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true)

        }
        else {
            cb(true)
        }
    }
}).single('thumbnail')


module.exports = multerSingleVideo