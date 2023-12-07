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
        const videoName = file.originalname.split('.')[0]
        const finalName = file.fieldname + '-' + videoName + '-' + hash + '.mp4'
        const originalName = {
            file,
            finalName
        }
        req.body.datesVideo = originalName
        cb(null, finalName)

    }
        }),
    storageS3: multerS3({
        s3: new aws.S3(),
        bucket: 'amigiosvideos',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: function (req, file, cb) {
            const hash = Date.now() + '-' + parseInt(Math.random() * (100000 + 100000) - 100000)
            let videoName = file.originalname.split('.')
            if (videoName.length > 2) {
                videoName = videoName.slice(0, videoName.length - 1).join('.')
            }
            else {
                videoName = videoName[0]
            }
            const finalName = file.fieldname + '-' + videoName + '-' + hash + '.mp4'
            const originalName = {
                file,
                finalName
            }
            req.body.datesVideo = originalName
            return cb(null, finalName)
        }
    })
}
const multerSingleVideo = multer({
    dest: path.resolve(__dirname, '..', '/attachments/'),
    storage: storage.storageS3,
    limits:{
        fileSize: 2.6 * 1024 * 1024 * 1024,
        
    },
    fileFilter(req, file, cb){
        const allowedMimes = ['video/mp4']
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true)
            
        }
        else {
            cb({err: 'tipo de arquivo invalido'})
        }
    },
}).single('video')


module.exports = multerSingleVideo
