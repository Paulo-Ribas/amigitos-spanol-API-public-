const app = require('./app')
require('dotenv').config()
const HttpServer = require('http').createServer(app)
const io = require('socket.io')(HttpServer,{
    rememberTransport: false, transports: ['websocket', 'polling','Flash Socket', 'AJAX long-polling'], cors:{
        origin: [process.env.PRODUCTION_DOMI, process.env.PRODUCTION_DOMI2],
    methods: ['GET', 'POST']
    }, maxHttpBufferSize: 3e8, allowEIO3: true,
})
const roomModel = require('../model/room')
const ChatController = require('../controllers/ChatController')
const room = require('../model/room')
let started = false
let signalResponded = []
io.on('connection', user => {
    user.on('joinFriendRequestsRoom', data => {
        user.join(data)
    })
    user.on('friendRequestSent', data => {
        io.to(data.room).emit('notification', {userId: data.userId})
    })
    user.on('joinRoom', async data => {
        try {
            user.join(data.room)
            let roomMembers = await roomModel.addMembers(data.room, data.user.id)
            io.to(data.room).emit('listMembersUpdate', roomMembers)
            if(!data.chat) io.to(data.room).emit('sendRequestForSynchronization', {id: data.user.id})
            let setRenderized =  await roomModel.setRendered(data.room)
            signalResponded.push({roomUrl:data.room})
            let rooms = await roomModel.getRoomsRenderized()
            io.emit('updateRoomPage', rooms)
            io.to(data.room).emit('userJoinConfirmed', {user: data.user})
        }
        catch(error) {
            console.log(error)
        }

    })
    user.on('requestForMembers', data => {
        roomModel.getRoomMembers(data.room).then(members => {
            io.to(data.room).emit('membersSent',{members, userId: data.user})
        }).catch(err => { 
    })
    })
    
    user.on('requestYTsynchronization', data => {
        io.to(data.room).emit('sendRequestForSynchronization', { id: data.user.id })
    })
    user.on('requestForChatMsgs', data => {
        io.to(data.room).emit('requestMsg', {user: data.user})
    })
    user.on('chatSent', data => {
        io.to(data.room).emit('chatRecived',data)
    })
    user.on('chatSecondChance', data => {
        io.to(data.room).emit('secondMemberSendChat', data)
    })
    user.on('newMSG', async data => {
        try {
            let spaceVerification = await ChatController.msgFiltter(data.text)
            await ChatController.stopSpam(spaceVerification)
            let msgTroll = await ChatController.msgTroll(spaceVerification)
            data.text = msgTroll
            io.to(data.room).emit('msg', data)
            io.to(data.room).emit('msgForBackUp', data)
        }
        catch (msg) {
            data.text = msg
            io.to(data.room).emit('msg', data)
            io.to(data.room).emit('msgForBackUp', data)

        }
    })
    user.on('playPause', data => {
        io.to(data.room).emit('PlayPause', data)
    })
    user.on('keysEvents', data => {
        io.to(data.room).emit('keysEvents', data)
    })
    user.on('aprenderMatematica', data => {
        io.to(data.room).emit('aprenderMatematica', data.event)
    })
    user.on('changeVideoToAll', data => {
        io.to(data.room).emit('changeVideo', data.video)
    })
    user.on('UrlSent', data => {
        io.to(data.room).emit('setVideoUrl', data)
    })
    user.on('synchronize', data => {
        io.to(data.room).emit('synchronize', data)
    })
    user.on('askForRealTimeSynchronization',data => {
        io.to(data.room).emit('askForRealTimeSynchronization', data.userId) 
    })
    user.on('askForCurrentTime', data => {
        io.to(data.room).emit('userAskingForSyncronization', {user: data.userId, datas: data})
    })
    user.on('playerState', data => {
        io.to(data.room).emit('playerStateRecived', data.playerState)
    })
    user.on('sentCurrentTime', data => {
        io.to(data.room).emit('currentTimeRecived', {user: data.userId, latencyServer: data.latencyServer, data: data.data, videoStats: data.videoStats})
    })
    user.on('syncronizationVerify', data => {
        io.to(data.room).emit('verifySynchronization', data)
    })
    user.on('desconectado', data => {
        console.log('esse deconectado funciona?', data)
        let userRoom = data.user
        user.disconnect(true)
        roomModel.disconnectMember(data.room, userRoom).then( array => {
            io.to(data.room).emit('listMembersUpdate', array)
            console.log('isso foi desconectado',array)
            io.emit('roomRefresh', array)
        }).catch(error => {
            console.log('erro do desconectado', error)
        })

    })
    user.on('disconnect', data=> {
        console.log(data, 'user desconecado')
    })
    user.on('answeredSignal', async data => {
        let dataRoom = data.roomUrl
        let alreadyhere = signalResponded.find(room => dataRoom === room.roomUrl)
        if(!alreadyhere) signalResponded.push({roomUrl: dataRoom})
        
    })
    user.on('deleteRoomsWith0Members', data => {
        roomModel.deleteRooms().then(room => {
            io.emit('updateRoomPage', room)
        }).catch(err => {
        })
    })
    user.on('askingYtCurrentTime', data => {
        io.to(data.room).emit('userAskingCurrentTime',data)
    })
    user.on('currentTimeYt', data => {
        io.to(data.room).emit('currentTimeYtRecived',data)
    })
    user.on('askingUploadCurrentTime', data => {
        io.to(data.room).emit('userAskingCurrentTime', data)
    })
    user.on('currentTimeUpload', data => {
        io.to(data.room).emit('currentTimeUploadRecived', data)
    })
     user.on('startVerify', data => {
        if(!started){
            StartVerifyRoom()
            started = true
        }
     })
    user.on('roomNotification', data => {
        io.to(data.userId).emit('invitedRoom', data.roomInfo)
    })
    user.on('kickMember', async data => {
        await roomModel.disconnectMember(data.room, data.member)
        io.to(data.room).emit('kickApply', data.member)
    })
    user.on('muteMember', async data => {
        try {
            await roomModel.muteUser(data.room, data.member)
            let room =  await roomModel.getRoom(data.room)
            io.to(data.room).emit('muteApply', room)
        } catch (error) {
            throw error
        }

    })
    user.on('unmuteMember', async data => {
        try {
            await roomModel.unmuteUser(data.room, data.member)
            let room = await roomModel.getRoom(data.room)
            io.to(data.room).emit('unmuteApply', {room})
        }
        catch(error) {
            throw error
        }
    })
    user.on('banMember', async data =>{
        try {
            await roomModel.banUser(data.room, data.member)
            await roomModel.disconnectMember(data.room, data.member)
            let room = await roomModel.getRoom(data.room)
            io.to(data.room).emit('banApply', {room, member: data.member})
        } catch (error) {
            throw error
        }
    })
    user.on('allowChoice', async data => {
        let {member} = data
        try {
            await roomModel.addMembersAllowedChoice(data.room, member)
            let updatedRoom = await roomModel.getRoom(data.room)
            io.to(data.room).emit('applyAllowChoiceVideos',{room: updatedRoom})
        }
        catch(error){
            throw error
        }
    })
    user.on('removeAllowedMemberChoice', async data => {
        try {
            await roomModel.removeMemberAllow(data.room, data.member)
            let room = await roomModel.getRoom(data.room)
            io.to(data.room).emit('applyRemoveAllowedMemberChoice', { room, member: data.member })
        } catch (error) {
            throw error
        }
    })
    user.on('giveMemberAdm', async data => {
        let {member} = data
        try {
           await roomModel.addMemberAdm(data.room, member)
           let room = await roomModel.getRoom(data.room)
           io.to(data.room).emit('applyAdm',{room, member}) 
        } catch (error) {
            throw error
        }
    })
    user.on('removeMemberAdm', async data => {
        try {
            await roomModel.removeMemberAdm(data.room, data.member)
            let room = await roomModel.getRoom(data.room)
            io.to(data.room).emit('applyRemoveAdm', {room})
        }
        catch (error) {
            throw error
        }
    })
    user.on('videoRequest', data => {
        io.to(data.room).emit('userVideoRequest', data)
    })
    user.on('requestAccepted', data => {
        io.to(data.requestInfo.room).emit('requestAllowed', data)
    })
    user.on('requestRejected', data => {
        io.to(data.requestInfo.room).emit('requestRefused', data)
    })
    
})

function StartVerifyRoom() {
    setInterval(() => {
        io.emit('signal')
    },5000);
    setInterval(async () => {
        try {
            let checked = await roomModel.checkRoomsActivyAndDelete(signalResponded)
            // 
            io.emit('updateRoomPage', checked.rooms)
            signalResponded = checked.rooms
        } catch (error) {
            this.err = error
        }
    }, 8000);
    setInterval(async () => {
        if (signalResponded.length === 0) {
            // 
            try {
                await roomModel.deleteAllRooms()
            }
            catch (error) {
                console.log(error)
            }
        }
    }, 11000);
}



let server = HttpServer.listen(3333)

module.exports = HttpServer