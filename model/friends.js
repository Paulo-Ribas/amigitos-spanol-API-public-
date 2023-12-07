const knex = require('../database/knex/connection')
const err = require('../controllers/errs/friendErrs')

class Friends {
    async findFriends(userId) {
        try {
            const friends = await knex.select('*').from('friends').where({user_id: userId}).orWhere({ friendsentrequest: userId })
            return friends
            
        } catch (error) {
            throw error
        }

    }
    async findUserFriendAmount(userId) {
        try {
            const friends = await knex.select('*').from('friends').where({ friendsentrequest: userId }).orWhere({ user_id: userId }).orWhere({ friend_id: userId })
            return friends.length

        } catch (error) {
            throw error
        }
    }
    async findUsersDatesFromFriendsRequests(friendId){
        try {
            let userRequests = await knex.select('users.id', 'users.profileimg', 'users.username').from('friendrequest').innerJoin('users', 'friendrequest.user_id', 'users.id').where({ friend_id: friendId })
            return userRequests
        } catch (error) {
            throw error
        }
    }
    async findUsersDatesFromFriends(userId){
        try {
            let userFriends = await knex.select('users.id', 'users.profileimg', 'users.username').from('friends').innerJoin('users', 'friends.friend_id', 'users.id').where({ user_id: userId }).orWhere({ friendsentrequest: userId }).union(function (build) {
                build.select('friend.id', 'friend.profileimg', 'friend.username')
                    .from('friends')
                    .innerJoin('users as friend', 'friends.user_id', 'friend.id')
                    .where({ user_id: userId })
                    .orWhere({ friendsentrequest: userId })
            });

            let onlyFriends = userFriends.filter(user => {
                return user.id != userId
            })
            return onlyFriends
        } catch (error) {
            throw error
        }
    }
    async sendFriendRequest(userId, friendId) {
        try {
            let sentRequest = await knex.insert({user_id: userId, friend_id: friendId}).into('friendrequest')
            if (sentRequest.length > 0) {
                return true 
            }
            else {
                err.requestErr = ' não foi possivel enviar soliticação para esse usuario'
                return {status: 400, err: err.requestErr}
            }
        } catch (error) {
            err.requestErr = ' não foi possivel enviar soliticação para esse usuario'
            throw err.requestErr
        }
        
    }
    async getRequest(userId, friendId){
        try{
            let userRequests = await knex.select('*').from('friendrequest').where({user_id: friendId, friend_id: userId })
             
            return userRequests[0]
        }
        catch(err) {
            err.requestErr = 'ocorreu um erro'
            throw err.requestErr
        }
    }
    async getFriend(userId, friendId){
        try {
            let friend = await knex.select('*').from('friends').where({ friend_id: friendId, user_id: userId }).orWhere({ friend_id: userId, user_id: friendId })
            return friend[0]
        } catch (error) {
            throw error
        }
    }
    async verifyRequest(userId, friendId){
        try {
            let userRequests = await knex.select('*').from('friendrequest').where({ friend_id: friendId, user_id: userId })
             
            return userRequests[0]
        }
        catch (err) {
            console.log('qual foi o erro? lol', err)
            err.requestErr = 'ocorreu um erro'
            throw err.requestErr
        }
    }
    async verifyIfRequestCanBeMade(userId, friendId){
        try{
            let requestExist = await this.getRequest(userId, friendId)
            let isFriend = await this.getFriend(userId, friendId)
            let isEqual = userId == friendId
            if(requestExist || isFriend || isEqual){
                err.requestErr = 'você não pode enviar o pedido de amizade para esse usuário'
                throw {err: err.requestErr}
            }
            return {canBeMade: true}

        }
        catch(error){
            throw error
        }
    }
    async showFriendsRequest(userId) {
        try {
            const request = await knex.select('*').from('friendrequest').where({friend_id: userId})
            return request
        } catch (error) {
            throw error
        }
    }
    async acceptFriendRequest(userId, friendId) {
        try {
            const accept = await knex.insert({ user_id: userId, friend_id: friendId, friendsentrequest: friendId }).into('friends')
            const deletRequest =  await this.removeRequest(userId, friendId)
            if (accept.length > 0 && deletRequest){
                return true
            }
            else {
                err.acceptErr = 'não foi possivel aceitar a essa requisição'
                return {status: 500, err: err.acceptErr}
            }
        } catch (error) {
            console.log(error)
            throw error
        }
        
    }
    async removeRequest(userId, friendId){
        try {
            const deletFriend = await knex.select("*")
                .from('friendrequest').where({ user_id: userId, friend_id: friendId })
                .orWhere({ user_id: friendId, friend_id: userId }).delete()
                 
            if (deletFriend) {
                return true
            }
            else {
                err.acceptErr = 'não foi possivel deletar esse amigo'
                return { status: 400, err: err.acceptErr }
            }
        }
        catch (error) {
            throw error
        }

    }
    async removeFriend(userId, friendId) {
        try {
            const deletFriend = await knex.select("*")
                .from('friends').where({ user_id: userId, friend_id: friendId })
                .orWhere({ user_id: friendId, friendsentrequest: userId }).delete()
            if (deletFriend.length > 0) {
                return true
            }
            else {
                err.acceptErr = 'não foi possivel deletar esse amigo'
                return { status: 400, err: err.acceptErr }
            }
        }
        catch(error){
            throw new Error(error)
        }
    }
}

module.exports = new Friends