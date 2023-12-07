const databaseRoomModel = require('../database/mongo/connection')
const roomSchema = require('../database/mongo/roomVideos')
const userModel = require('./user')
const roomModel = databaseRoomModel.rommConnection.model('room', roomSchema)
const err = require('../controllers/errs/roomErrs')

class Room {
    async disconnectMember(roomUrl, userId) {
        let room = await roomModel.findOne({ url: roomUrl })
        if(room) {
            let user = await userModel.findUserById(userId.id)
            if(user.length > 0) {
                let newArrayMembers = room.members.filter(member => {
                    return member.id != user[0].id
                })
                try {
                    await roomModel.findOneAndUpdate({url: roomUrl}, {members: newArrayMembers})
                    return newArrayMembers

                }
                catch(error) {
                    throw error
                }
            }
            else {
                return false
            }
            
        }
        else {
            return false
        }

        
    }
    async createRoom(dates){
        const { url, filesVideos = [], userAdm, passChoice, roomName, maxMembers, type, password, rulesType } = dates
        let pass = false
        passChoice ? pass = true : pass
        let newRoom = new roomModel({
            roomName,
            url,
            filesVideos,
            userAdm,
            pass,
            password,
            maxMembers,
            type,
            rendered: false,
            rulesType
        })
        try {
            let created = await newRoom.save()
            return created
            
        } catch (error) {
            throw error
        }


    }
    async createRoomUrl(){
        const alfb = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        const ALFB = alfb.map(letter => {
            return letter.toUpperCase()
        })
        const randN = parseInt((Math.random() * 1000 + 1000 - 1000))
        let randAlfbIndex = parseInt(Math.random() * 24 + 24 - 24)
        let randALFBindex = parseInt(Math.random() * 24 + 24 - 24)
        let finalUrl
        randN >= 500 ? finalUrl = '' + ALFB[randALFBindex] + alfb[randAlfbIndex] + randN 
        : finalUrl = '' + randN + ALFB[randALFBindex] + alfb[randAlfbIndex]
         
        let foundUrl = await this.checkUrl(finalUrl)
        if (foundUrl) {
            return this.createRoomUrl()
        }
        else {
            return finalUrl

        }

    }
    async getRooms() {
        try {
            let room = await roomModel.find({})
            return room
        } catch (error) {
            throw error
        }
    }
    async getRoomsRenderized(){
        try{
            let rooms = await roomModel.find({rendered: true})
            return rooms
        }
        catch(error){
            throw error
        }

    }
    async deleteRooms(){
        try{
            await roomModel.deleteMany({members:{$size: 0},rendered: true})
            let novoArray = await this.getRoomsRenderized()
            return novoArray
                
        }
        catch(error){
            throw new Error(error)
        }
    }
    async deleteRoom(roomUrl){
        try {
            await roomModel.deleteOne({url: roomUrl, rendered: true})
        } catch (error) {
            throw error
        }
    }
    async deleteAllRooms() {
         
        try {
            await roomModel.deleteMany({rendered: true})
        }
        catch(error) {
             
        }
    }
    async addMembers(roomUrl, userId) {
        try {
            let room = await roomModel.findOne({url: roomUrl})
            let user = await userModel.findUserById(userId)
             
            if (room) {
                if (user.length < 1) {
                    return false
                }
                let acctuallyRoomMembers = room.members
                let found = acctuallyRoomMembers.find(members => {
                    return members.id === user[0].id
                })
               if (found) {
                return acctuallyRoomMembers
               }
               else {
                   try {
                       acctuallyRoomMembers.push(user[0])
                       let updated = await roomModel.findByIdAndUpdate(room._id, {members: acctuallyRoomMembers})
                       if (updated) {
                           return acctuallyRoomMembers
                           
                       }
                       else {
                            
                       }
                    
                   } catch (error) {
                     
                   }
               }
            }
            else {
                 
            }
            
        } catch (error) {
             
        }
    }
    async banUser(roomUrl, user) {
        try {
            let room = await roomModel.findOne({ url: roomUrl })
            if (room) {
                let acctuallyRoomMembers = room.members.filter(member => {
                    return member.id != user.id
                })
                let acctuallyRoomBanneds = room.banneds
                acctuallyRoomBanneds.push(user)
                let updated = await roomModel.findByIdAndUpdate(room._id, { members: acctuallyRoomMembers, banneds: acctuallyRoomBanneds })

                if (updated) {
                    return updated

                }
                else {
                    throw {err: 'ocorreu um erro ao atualizar a sala'}
                }
            }
            else {
                throw {err: 'sala não encontrada'}
            }

        } catch (error) {
            throw {err: error}
        }
    }
    async muteUser(roomUrl, user) {
        try {
            let room = await roomModel.findOne({ url: roomUrl })
            if (room) {
                let acctuallyRoomMuted = room.isMuted
                acctuallyRoomMuted.push(user)
                let updated = await roomModel.findByIdAndUpdate(room._id, { isMuted: acctuallyRoomMuted})

                if (updated) {
                    return updated

                }
                else {
                    throw { err: 'ocorreu um erro ao atualizar a sala' }
                }
            }
            else {
                throw { err: 'sala não encontrada' }
            }

        } catch (error) {
            throw { err: error }
        }
    }
    async unmuteUser(roomUrl, user) {
        try {
            let room = await roomModel.findOne({ url: roomUrl })
            if (room) {
                let acctuallyRoomMuted = room.isMuted.filter(member => {
                    return member.id != user.id
                })
                let updated = await roomModel.findByIdAndUpdate(room._id, { isMuted: acctuallyRoomMuted})

                if (updated) {
                    return updated

                }
                else {
                    throw { err: 'ocorreu um erro ao atualizar a sala' }
                }
            }
            else {
                throw { err: 'sala não encontrada' }
            }

        } catch (error) {
            throw { err: error }
        }
    }
    async addMembersAllowedChoice(roomUrl, member) {
        try {
            let room = await roomModel.findOne({url: roomUrl})
            if(!room) throw {err: 'sala não encontrada'}
            let membersChoiceAllowed = room.membersAllowedChoice
            membersChoiceAllowed.push(member)
            await roomModel.updateOne({ url: roomUrl }, { membersAllowedChoice: membersChoiceAllowed })
            
        } catch (error) {
            throw { err: error}
        }

    }
    async removeMemberAllow(roomUrl, member) {
        try {
            let room = await roomModel.findOne({url: roomUrl})
            if(!room) throw {err: 'sala não encontrada'}
            let acctuallyRoomMembersChoiceAllowed = room.membersAllowedChoice.filter(user => {
                return user.id != member.id
            })
            await roomModel.updateOne({ url: roomUrl }, { membersAllowedChoice: acctuallyRoomMembersChoiceAllowed})
            return room
        } catch (error) {
            throw {err: error}
        }
    }
    async addMemberAdm(roomUrl, member){
        try {
            let room = await roomModel.findOne({ url: roomUrl })
            if (!room) throw { err: 'sala não encontrada' }
            let membersAdm = room.adms
            membersAdm.push(member)
            await roomModel.updateOne({ url: roomUrl }, { adms: membersAdm })

        } catch (error) {
            throw { err: error }
        }
    }
    async removeMemberAdm(roomUrl, member){
        try {
            let room = await roomModel.findOne({ url: roomUrl })
            if (!room) throw { err: 'sala não encontrada' }
            let acctuallyRoomMembersAdm = room.adms.filter(user => {
                return user.id != member.id
            })
            await roomModel.updateOne({ url: roomUrl }, { adms: acctuallyRoomMembersAdm })
            return room
        } catch (error) {
            throw { err: error }
        }
    }
    async checkRoomExists(roomUrl) {
        let roomExits = await roomModel.findOne({url: roomUrl})
        if (roomExits < 1) {
            return false
            
        }
        return true
    }
    async getRoomMembers (roomUrl) {
        let room = await roomModel.findOne({url: roomUrl})
        return room.members
    }
    async checkUrl(url){
        let urlFound = await roomModel.findOne({url: url})
        if (urlFound) {
            return true
        }
        return false
    }
    async getRoom(roomUrl) {
        try {
            const room = await roomModel.findOne({url: roomUrl}, {password: 0})
            if(room){
                return room
            }
            else {
                return undefined
            }
        } catch (error) {
            return undefined
        }

    }
    async setRendered(roomUrl) {
         
        try {
            let room = await roomModel.findOneAndUpdate({ url: roomUrl }, { rendered: true})
            return room
        }
        catch(error){
            throw error
        }
    }
    async verifiyRoomName(roomName){
        if(roomName != undefined && roomName != '') {
            if (roomName.length <= 1) {
                err.createError = "nome muito curto"
                return {status:400, err: err.createError}
            }
            let roomNameCaracteresVerify = roomName.split('')
            let checkNumberOfCaractereEmpty = 0
            roomNameCaracteresVerify.forEach(caractere => {
                caractere === ' ' ? checkNumberOfCaractereEmpty++ : caractere
            })
             
            if (checkNumberOfCaractereEmpty === roomName.length) {
                err.createError = "nome invalído"
                return {status:400, err: err.createError}
            }
            return {err: false}
        }
        else {
            err.createError = "nome inválido"
            return {status: 400, err: err.createError}
        }
    }
    async verifyRoomMembers(roomMembers){
        if (!isNaN(roomMembers)) {
            let qtdInt = parseInt(roomMembers)
            if (qtdInt > 50 || qtdInt < 1) {
                err.createError = 'Numero De Membros Invalido'
                return {status: 400, err: err.createError} 
            }  
            return {err: false}
        }   
        else {
            err.createError = 'Forneça Um Numero Para Quantidade De Membros'
            return {status: 400, err: err.createError}
        }

    }
    async verifyRoomPassword(roomPass){
        if (roomPass != undefined && roomPass != '') {
            if (roomPass.length <= 1) {
                err.createError = "senha muito curta"
                return { status: 400, err: err.createError }
            }
            let roomPassCaracteresVerify = roomPass.split('')
            let checkNumberOfCaractereEmpty = 0
            roomPassCaracteresVerify.forEach(caractere => {
                caractere === ' ' ? checkNumberOfCaractereEmpty++ : caractere
            })
            if (checkNumberOfCaractereEmpty === roomPass.length) {
                err.createError = "senha invalída"
                return { status: 400, err: err.createError }
            }
            return {err: false}
        }
        else {
            err.createError = "escolha uma senha"
            return { status: 400, err: err.createError }
        }
    }
    async verifyRoomUploadFiles(uploadFiles, type) {
        if (uploadFiles.length  > 0 && Array.isArray(uploadFiles)) {
            return {err: false}
        }
        if(uploadFiles.length === 0 && type === 'youtube') {
            return {err:false}
        }
        err.createError = 'selecione pelo menos 1 video'
        return {status: 400, err: err.createError}
        
    }
    async joinRoomByPass(roomUrl, pass){
         
        try{
            let room = await roomModel.findOne({url: roomUrl})
             
            if(room.password === pass) {
                return true
            }
            else {
                return false
            }
        }
        catch(error){
             
        }
    }
    async compareRoomMembersWithMaxMembers(roomUrl){
        try {
            let room = await roomModel.findOne({url:roomUrl})
            return room.members.length < room.maxMembers

        }
        catch(error){
            throw error
        }
        

    }
    async checkRoomsActivyAndDelete(roomArray){
        try {
            let rooms = await this.getRoomsRenderized()
            let exists = undefined
            let deleted = undefined
            for (let i = 0; i < rooms.length; i++) {
                exists = roomArray.find(room => {
                    return room.roomUrl === rooms[i].url
                })
                if (!exists) {
                    await this.deleteRoom(rooms[i].url)
                    deleted = true
                }   
    
            }
            let roomsUpdated = await this.getRoomsRenderized()
            return {deleted, rooms: roomsUpdated}

            
        } catch (error) {
            throw error
         
        }

    }
}

module.exports = new Room