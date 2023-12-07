const databaseVideoModel = require('../database/mongo/connection')
const VideoSchema = require('../database/mongo/usersVideos')
const VideoModel = databaseVideoModel.videosConnection.model('userVideos', VideoSchema)
const userModel = require('./user')
const err = require('../controllers/errs/userErrs')
const fluentFfmpeg = require("fluent-ffmpeg")
const path = require('path')
const fs = require('fs')
const streamBlob = require('blob-stream')
const thumbnailSchema = require('../database/mongo/thumbnails')
const aws = require('@aws-sdk/client-s3')
const s3 = new aws.S3()

const thumbnailModel = databaseVideoModel.thumbnails.model('thumbnails', thumbnailSchema)

class video {
    async newVideo(dates){
        const { userID, location, cloudFront, thumbnailLocation, thumbnailName } = dates
        const {originalname} = dates.datesVideo.file
        const file = dates.datesVideo.finalName
        let fileName = originalname.split('.')
        if (fileName.length > 2) {
            fileName = fileName.slice(0, fileName.length - 1).join('.')
        }
        else {
            fileName = fileName[0]
        }
        try {
            const newVideo = new VideoModel({ userID, fileName, location, file: file, cloudFront, thumbnailLocation, thumbnailName })
            let videoSaved = await newVideo.save()
            return videoSaved
        } catch (error) {
            throw error
        }

    }
    async getVideos(id){
        try {
            let videos = await VideoModel.find({userID: id})
            return videos
        } catch (error) {
            throw error
        }
    }
    async deleteVideo(userId, video ) {
        try {
            let videoDeleted = await VideoModel.findOneAndDelete({file: video, userID: userId})
            if (videoDeleted) {
                return true
            }
            else {
                err.video = 'video não encontrado'
                return {status: 404, err: err.video}
            }
            
        } catch (error) {
             err.server = 'ocorreu um erro no servidor'
             throw {status: 500, err: err.server}
        }
    }
    async deleteThumbnail(userId, video) {
        return new Promise(async (resolve, reject) => {
            try {
                let videoMongo = await VideoModel.findOne({file: video, userID: userId})
                let thumbnail = videoMongo.thumbnailName
                s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET_THUMBNAIL, Key: thumbnail }, async (err, data) => {
                    if (err) {
                        throw { erro: 'não foi possivel apagar o video' }
                    }
                    if (data) {
                            return resolve()
                        } 
                    })   
                
            } catch (error) {
                console.log(error, 'erro deletar')
                err.server = "ocorreu um erro no servidor"
                reject({status: 500, err: err.server})
            }
        })
    }
    async compareVideoName(userId, name){
        const user = await userModel.findUserById(userId)
        if (user.length > 0) {
            try {
                const exits = await VideoModel.find({userID: userId, fileName: name})
                if (exits.length > 0) {
                    return true
                }
                else {
                    return false
                }
                
            } catch (error) {
                throw error
            }
        }
        else {
            throw {err: 'erro'}

        }
    }
    
    async getThumbnailBlob(videoParam){
        let video = videoParam.tempFilePath
        let folder = path.resolve(__dirname, '../', 'attachments', 'thumb')
        let format = 'mp4'
        let imageName = `${videoParam.name}-${parseInt(Math.random() * 333333)}.png`
        return new Promise((resolve, reject) => {
            fs.rename(video, `${video}.${format}`, err => {
                if (err) {
                    throw err
                }
                let videoStream = `${video}.${format}`
                // 
                const ffmpeg = fluentFfmpeg(videoStream).duration(3).on('start', function (commandLine) {
                    // 
                })
                    .on('progress', function (progress) {
                    })
                    .on('error', function (err, stdout, stderr) {
                        // 
                        fs.unlink(video  + '.mp4', err => {
                            if(err) throw err
                        })
                        reject({err})
                    })
                    .on('end', function () {
                    });
    
                ffmpeg.screenshots({
                    count: 1,
                    timemarks: ['00:00:01'],
                    filename: imageName,
                    folder: folder,
                    size: '896x504',
                    ffmpeg_options: [
                        '-pix_fmt', 'yuv420p',
                    ],
                }).on('error', (err) => {
                    fs.unlink(video  + '.mp4', err => {
                        if(err) throw err
                    })
                    reject({err:err})
                }).on('end', () => {
                    resolve({ videoPath: `${video}.${format}`, thumbPath:`${folder}/${imageName}` })
                }).on('progress', function (progress) {
                    // 
    
                })
    
            })
        })
    }
    async convertVideo(video, user){
        let videoTemp = video.tempFilePath
        let format = 'mp4'
        let newVideoPath = `${videoTemp}.${format}`
        try {
            return new Promise((resolve, reject) => {
                fs.rename(videoTemp, newVideoPath, err => {
                    if (err) {
                        throw err
                    }
                    let split1 = newVideoPath.split('.')
                    let folderToNormalize = split1.slice(0, -1).join('.')
                    let normalized = path.normalize(folderToNormalize)
                    let split2 = normalized.split('\\')
                    let newName = split2[split2.length - 1] + '.mp4'
                    let newPatch = path.join(__dirname, '../', 'attachments', 'videoConverted')
                    let pathComplete = path.join(__dirname, '../', 'attachments', 'videoConverted', newName)
                    /* console.log(`
                        newName(${newName})
                        newPatch(${newPatch} 
                        newVideoPath(${newVideoPath}) 
                        pathComplete(${pathComplete})`) */


                    if (!fs.existsSync(newPatch)){
                        fs.mkdir(newPatch, {recursive:true}, (done)=> {
                            return done
                        })
                    }
                    fluentFfmpeg(newVideoPath).format('mp4').on('end', () => {
                        resolve({convertedVideo: pathComplete})
                    })
                        .on('progress', function (progress) {
                            let percent = Math.round(progress.percent)
                            // 
                            // 
                        })
                        .on('error', (err) => {
                            fs.unlink(videoTemp + '.mp4', err => {
                                if(err) throw err
                            }) 
                            reject(err)
                        })
                        .save(pathComplete)
                })
                })
        } catch (error) {
            throw error
        }
            
    }
    readVideo(video){
        return new Promise((resolve, reject) => {
            let videoRead = fs.createReadStream(video)
            let blob = streamBlob()
            videoRead.on('data', data=> {

            })
            videoRead.pipe(blob)
            blob.on('finish', function() {
                resolve({video: result})
            })
            blob.on('error', (error) => {
                reject({err: error})
            })
        })
    }

    
}

module.exports = new video