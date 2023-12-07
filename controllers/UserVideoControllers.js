const userModel = require('../model/user')
const videoModel = require('../model/videos')
const imageModel = require('../model/image')
const err = require('./errs/userErrs')
const aws = require('@aws-sdk/client-s3')
const s3 = new aws.S3()
const fs = require('fs')
const server = require('../src/server')


class Controller {
    async createThumbnail(req, res) {
        let video = req.files.video
        try{
            let thumbnail = await videoModel.getThumbnailBlob(video)
            req.on('close', ()=>{
                fs.unlink(thumbnail.thumbPath, err => {
                    if(err) throw err
                })
                fs.unlink(video.tempFilePath + '.mp4', err => {
                    if(err) throw err
                })
            })
            res.sendFile(thumbnail.thumbPath, err => {
                if(err) {
                    console.log(err)
                    res.status(500)
                    fs.unlink(thumbnail.thumbPath, err => {
                        if(err) throw err
                    })
                    fs.unlink(video.tempFilePath + '.mp4', err => {
                        if(err) throw err
                    })
                    return
                }
                res.on('finish', () => {
                    fs.unlink(thumbnail.thumbPath, err => {
                        if(err) throw err
                    })
                    fs.unlink(video.tempFilePath + '.mp4', err => {
                        if(err) throw err
                    })
                })
            })
        }
        catch(err){
            console.log(err, 'erro d+')
            res.status(500).send({err: err})
        }
    }
    async saveThumb(req, res) {
        let name = req.body.thumbnail.finalName
        let location = req.file.location
        try {
            await imageModel.saveThumb(name, location)
            res.status(200).send({thumbnail: name})
        } catch (error) {
            console.log(err)
            res.status(500)
        }
    }
    async videoProcessBeforeUpload(req, res){
        let video = req.files.video
        try {
            let videoConverted = await videoModel.convertVideo(video)
            req.on('close', err => {
                fs.unlink(videoConverted.convertedVideo, err => {
                    if(err) throw err
                })
                fs.unlink(video.tempFilePath + '.mp4', err => {
                    if(err) throw err
                })
            })       
            res.sendFile(videoConverted.convertedVideo, function(err){
                if(err){
                    console.log(err)
                    res.status(500).send({ err: err })   
                    fs.unlink(videoConverted.convertedVideo, err => {
                        if(err) throw err
                    })
                    fs.unlink(video.tempFilePath + '.mp4', err => {
                        if(err) throw err
                    })
                    return
                }
            })
            res.on('finish', ()=> {
                fs.unlink(videoConverted.convertedVideo, err => {
                    if(err) throw err
                })
                fs.unlink(video.tempFilePath + '.mp4', err => {
                    if(err) throw err
                })
            })

        }
        catch (error) {
            console.log('error', error)
            res.status(500).send({ err: error })
        }
    }
    async uploadVideo(req, res){
        const userID = req.body.tokenDecoded.id
        if(!userID){
             res.status(400).send({err: 'faça login para upload de arquivos'})
            return

        }
        // 
        if(!req.body.datesVideo) return res.status(400).send({err:'envio cancelado'})
        const datesVideo = req.body.datesVideo
        const dir = req.body.dir
        const cloudFront = 'https://d1gfyn388aujh8.cloudfront.net/' + datesVideo.finalName
        const thumbnailName = req.headers.thumb
        const dates = {
            dir,
            userID,
            datesVideo,
            location: req.file.location,
            cloudFront,
            thumbnailName: 'tardis.jpg',
            thumbnailLocation: '/tardis.jpg'
        }
        let videoName = datesVideo.file.originalname.split('.')
        if (videoName.length > 2) {
            videoName = videoName.slice(0, videoName.length - 1).join('.')
        }
        else {
            videoName = videoName[0]
        }
        try {
            const thumbnail = await imageModel.getThumbnail(thumbnailName)
            dates.thumbnailName = thumbnail.name
            dates.thumbnailLocation = thumbnail.location
            await imageModel.deleteThumbnail(thumbnailName)
            const videoExist = await videoModel.compareVideoName(userID, videoName)
            if (videoExist) {
                err.video.name = 'video já existente'
                res.status(400).send({err: err.video.name})
                return
            }
            else {
                try {
                    const videoSaved = await videoModel.newVideo(dates)
                    if (videoSaved) {
                        res.status(200).send({msg: 'foi adicionado no banco de dados', video: videoSaved})
                        return
                    }
                    else {
                        res.sendStatus(402)
                    }
                }
                catch (error) {
                    err.video.name = 'ocorreu um erro ao salvar o video'
                    res.status(500).send({msg: err.video.name})
                } 
            }
        }
        catch(error) {
            throw error
        }
        
    }
    async getVideos(req, res) {
        const userId = req.body.tokenDecoded.id
        try {
            const videos = await videoModel.getVideos(userId)
            if (videos) {
                res.status(200).send({ videos: videos })
                return
            }
            else {
                res.sendStatus(402)
            }
            
        } catch (error) {
            throw error
        }
    }
    async deleteVideo(req, res) {
        let fileName = decodeURI(req.params.file)
        let id = req.body.tokenDecoded.id
        s3.deleteObject({Bucket: process.env.AWS_S3_BUCKET ,Key: fileName}, async (err, data) => {
            if(err){
                return res.status(500).send({ erro: 'não foi possivel apagar o video' })
            }
            if(data){
                try {
                    await videoModel.deleteThumbnail(id, fileName)
                    await videoModel.deleteVideo(id, fileName)
                    return res.status(200).send({ foi: true })

                } catch (error) {
                    return res.status(500).send({ erro: 'não foi possivel apagar o video ' + error })
                }
                
            }
        })  
    }

}

module.exports = new Controller