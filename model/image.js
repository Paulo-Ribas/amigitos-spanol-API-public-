const knex = require('../database/knex/connection')
const err = require('../controllers/errs/userErrs')
const databaseVideoModel = require('../database/mongo/connection')
const thumbnailSchema = require('../database/mongo/thumbnails')
const thumbnailModel = databaseVideoModel.thumbnails.model('thumbnails', thumbnailSchema)

class Imagem {
    async getUserImgUrl(id){
        try {
            let imgUrl = await knex.select('*').where({id:id}).table('users')
            return imgUrl
        } catch (error) {
            throw {status: 500, err: 'não foi possivel mudar a imagem por algum motivo lol'}
        }
    }
    async setImgDefault(id){
        try {
            await knex.select('*').where({ id: id }).update({profileImg:'/default.png'}).table('users')
        } catch (error) {
            throw { status: 500, err: 'não foi possivel mudar a imagem por algum motivo lol'}
        }
    }
    async saveThumb(name, location){
        try{
            const newThumbnail = new thumbnailModel({name, location})
            await newThumbnail.save()
            return
        }
        catch(err){
            throw err
        }
    }
    async getThumbnail(name){
        try {
            const thumbnail = await thumbnailModel.findOne({name:name})
            return thumbnail
        } catch (error) {
            throw error
        }
    }
    async deleteThumbnail(name){
        try {
            await thumbnailModel.deleteOne({name: name})
            return
        } catch (error) {
            throw error
        }
    }
}

module.exports = new Imagem