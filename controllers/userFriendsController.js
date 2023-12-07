const userModel = require('../model/user')
const friendModel = require('../model/friends')

class Controller {
    async getUserFriends(req, res){
        let userId = req.params.userId
        let friendList = await friendModel.findFriends(userId)

        if (friendList) {
            res.status(200).send({friendList})
            return
        }
        else {
            res.status(500).send({err: 'não foi possivel carregar os amigos'})
        }

    }
    async getFriendsAmount(req, res){
        let userId = req.params.userId
        try {
            let amount = await friendModel.findUserFriendAmount(userId)
            res.status(200).send({friendsAmount: amount})
        }
        catch(err) {
            return res.status(500).send({ erro: 'ocorreu um erro' })
        }
    }
    async getFriendRequest(req, res){
        let userId = req.body.tokenDecoded.id
        let friendId = req.params.friendId
        try {
            let request = await friendModel.getRequest(userId, friendId)
            res.status(200).send({request: request})
        } catch (error) {
            res.status(400).send({err: error})
        }
    }
    async isPeding(req, res){
        console.log('bem veio aqui lol')
        let userId = req.body.tokenDecoded.id
        let friendId = req.params.friendId
        try {
            let request = await friendModel.verifyRequest(userId, friendId)
            res.status(200).send({ request })
        } catch (error) {
            console.log(error, 'é isso ?' , userId, friendId)
            res.status(400).send({ err: error })
        }
    }
    async getUsersFriendRequest(req, res){
        let id = req.body.tokenDecoded.id
        try{
            let users = await friendModel.findUsersDatesFromFriendsRequests(id)
            res.status(200).send({users:users})
        }
        catch(error){
            res.status(500)
        }

    }
    async getFriendsInfo(req, res){
        let userId = req.params.userId
        try {
            let friends = await friendModel.findUsersDatesFromFriends(userId)
            res.status(200).send({friendList: friends})
        } catch (error) {
            res.status(500)
        }

    }
    async addFriend(req, res){
        let userId = req.body.tokenDecoded.id
        let friendId = req.body.friendId
        try{
            let requestCanBeMade = await friendModel.verifyIfRequestCanBeMade(userId, friendId)
             
            let sent = await friendModel.sendFriendRequest(userId, friendId)
    
            if(!sent.err) {
                res.status(200).send({msg: 'pedido enviado com sucesso'})
                return
            }
            else {
                res.status(sent.status).send({err:sent.err})
            }
        }
        catch(error){
            res.status(500).send({err: error.err})
        }

    }
    async acceptFriend(req, res){
        let userId = req.body.tokenDecoded.id
        let friendId = req.body.friendId
        try{
            let accepted = await friendModel.acceptFriendRequest(userId, friendId)
    
            if(!accepted.err){
                res.sendStatus(200)
                return
            }
            else {
                console.log('erro')
                res.status(accepted.status).send({err: accepted.err})
            }

        }
        catch(err){
            console.log(err, 'outro erro')
         return res.status(500).send({ erro: 'ocorreu um erro'})
        }


    }
    async refuseRequest(req, res){
        let friendId = req.params.friendId
        let userId = req.body.tokenDecoded.id
        try {
            let deleted = await friendModel.removeRequest(userId, friendId)
            res.status(200).send({deleted: deleted})
        } catch (error) {
            res.status(500).send({err: error})
            throw error
        }
    }
    async removeFriend(req, res){
        const friendId  = req.params.friendId
        const userId = req.body.tokenDecoded.id
        const deleted = await friendModel.removeFriend(userId, friendId)
        if (deleted) {
            res.status(200).send({msg:'amigo deletado'})

            return
            
        }
        res.status(500).send({msg: 'amigo não deletado'})

    }
}

module.exports = new Controller