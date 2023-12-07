const roomModel = require('../model/room')
const userModel = require('../model/user')
const err = require('./errs/roomErrs')

class Controller {
    async CreateRoom(req, res){
        const id = req.body.tokenDecoded.id
        const userAdm = id
        let { passChoice, roomName, filesVideos, maxMembers, type, password, rulesType} = req.body
        const roomNameVerify = await roomModel.verifiyRoomName(roomName)
        const roomQtdMembersVerify = await roomModel.verifyRoomMembers(maxMembers)
        let roomPassVerify = {}
        if(passChoice) {
            roomPassVerify = await roomModel.verifyRoomPassword(password)
        }
        const roomFilesVerify = await roomModel.verifyRoomUploadFiles(filesVideos, type)
        if (!roomNameVerify.err && !roomQtdMembersVerify.err && !roomPassVerify.err && !roomFilesVerify.err ) {
            const urlRoom = await roomModel.createRoomUrl()
            let dates = {
                url:urlRoom,
                userAdm,
                roomName,
                filesVideos,
                passChoice,
                maxMembers,
                type,
                password,
                rulesType,
            }
            const room = await roomModel.createRoom(dates)
            res.status(200).send({param: room})
            return 
        }
        else {
            if (roomNameVerify.err) {
                res.status(roomNameVerify.status).send({err: roomNameVerify.err})
                return 
            }
            if (roomQtdMembersVerify.err) {
                res.status(roomQtdMembersVerify.status).send({err: roomQtdMembersVerify.err})
                return
            }
            if (roomPassVerify.err) {
                res.status(roomPassVerify.status).send({ err: roomPassVerify.err})
                return
            }
            if (roomFilesVerify.err) {
                res.status(roomFilesVerify.status).send({err: roomFilesVerify.err})
                return
            }

        }
        
    }
    async getRooms(req, res){
        const rooms = await roomModel.getRooms()
        res.status(200).send({rooms})
    
    }
    async getRoomsRenderizated(req, res){
        const rooms = await roomModel.getRoomsRenderized()
        res.status(200).send({rooms})
    }
    async addMember(req, res) {
        const user = req.body.tokenDecoded.id
        const room = req.body.roomUrl
        if (user && room) {
            try {
                let memberAddeded = await roomModel.addMembers(room, user)
                if (memberAddeded === false) {
                    res.sendStatus(200)
                    return
                }
                else {
                    res.status(200)
                }
            } catch (error) {
                res.status(400).send({ err: 'não foi possivel concluir a ação' })
            }
            
        }
    }
    async removeMember(req, res) {
        const {roomUrl, userId} = req.body
        const urlFound = await roomModel.checkUrl(roomUrl)
        if (urlFound) {
            const userFound = await userModel.findUserById(userId)
            if (userFound.length > 0) {
                try {
                    const novoArray = await roomModel.disconnectMember(roomFound, userFound)
                    res.status(200).send({members: novoArray})
                    return
                }
                catch(erro) {
                    res.status(402).send({erro})
                }
                
            }
            else {
                res.status(405).send({erro: 'usuario nao existe'})
            }
            
        }
        else {
            res.status(400).send({erro: 'url não existe'})
        }
    }
    async getMembers(req, res){
        let roomUrl = req.body.roomUrl
        let roomExits = await roomModel.checkRoomExits(roomUrl)
        if (!roomExits) {
            err.urlRoomError = 'não foram encontrada a sala'
            res.status(400).send(err.urlRoomError)
            return
        }
        let members = await roomModel.getRoomMembers(roomUrl)
        res.json({members})
        return

    }
    async getRoom(req, res) {
        const roomUrl = req.params.url
        try {
            const room = await roomModel.getRoom(roomUrl)
            res.status(200).send({room})
            return
        } catch (error) {
            res.status(400).send({err: 'sala não encontrada'})
        }
    }
    async joinByPass(req, res){
        let pass = req.body.password
        let roomUrl = req.body.roomUrl
        let correct = await roomModel.joinRoomByPass(roomUrl, pass)
        let full = await roomModel.compareRoomMembersWithMaxMembers(roomUrl)
        if(!correct){ 
            res.status(400).send({ err: 'senha incorreta' })
            return
        }
        if (correct && !full) {
            res.status(400).send({ err: 'sala lotada' })
        }
        if(correct && full) {
            res.status(200).send({correct: correct})
        }
        
    }
}

module.exports = new Controller