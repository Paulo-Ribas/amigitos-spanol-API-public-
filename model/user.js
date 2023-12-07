const knex = require('../database/knex/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const err = require('../controllers/errs/userErrs')
const uuidToken = require('./token')
const secret = 'paulobrasil33'
class User{
    async saveUser(username, email, password){
        /*  const salt =  await bcrypt.genSalt(11) */
        const emoji = await this.emojiVerification(username)
        let description = 'desejo um abraço e um beijo ao Paulo ou ao Gusta <3'
           try {
                const newPassword = await bcrypt.hash(password, 13)
                await knex.insert({ username, email, password: newPassword, emoji, description}).into('users')
            } catch (error) {
               throw error
            }

    }
    async findUsersDates (username, email) {
        let user
        try {
            username ? user = await knex.select('*').from('users').where({username: username}) : user
            email ? user = await knex.select('*').from('users').where({email: email}) : user = user
            if (user) {
                return user
            }
            else {
                return []
            }
            
        } catch (error) {
            throw error
        }
    }
    async findUserById(id){
        try {
            const user = await knex.select('username', 'email', 'profileimg', 'id', 'emoji', 'role', 'choice', 'description').where({id}).table('users')
            return user
        } catch (error) {
            throw error
        }
    }
    async findUsers() {
        const users = await knex.select('username', 'profileimg', 'id', 'emoji').from('users')
        return users
    }
    async editName(id, username, email) {
        try {
            let changed = await knex.select('*').from('users').where({ id: id }).update({ username: username })
            if(changed === 1) {
                let token = await this.generateToken(email)
                return token
            }
            else {
                return false
            }
        }
        catch (err) {
            throw new Error(err)
        }
    }
    async editEmail(id, email) {
        try {
            let changed = await knex.select('*').from('users').where({ id: id }).update({ email })
            if (changed === 1) {
                let token = await this.generateToken(email)
                return token
            }
            else {
                return false
            }
        }
        catch (err) {
            console.log(err)
            throw err
        }
    }
    async editPassword(id, password, email) {
        try {
            let hash = await bcrypt.hash(password, 13)
            let user = await this.findUserById(id)
            let changed = await knex.select('*').from('users').where({ id: id }).update({ password: hash })
            if (changed === 1) {
                let token = await this.generateToken(user[0].email)
                return token
            }
            else {
                return false
            }
        }
        catch (err) {
            throw err
        }
    }
    async editImgProfile(id, imgUrl) {
        let user = await knex.select('*').where({id:id}).from('users')
        if (user.length > 0) {
            try {
                let changed = await knex.select('*').where({id:id}).from('users').update({profileimg: imgUrl})
                if (changed === 1) {
                    let token = await this.generateToken(user[0].email)
                    return token
                }
                else {
                    return false
                }

            } catch (error) {
                err.server = 'ocorreu um erro, tente novamente mais tarde'
                return {status: 500, err: err.server}
            }
            
        }
        else {
            err.user = 'logue para editar a imagem'
            return {status: 500, err: err.user}
        }

    }
    async saveDescription(description, id) {
        try {
            await knex.select('*').where({id:id}).from('users').update({description: description})
        } catch (error) {
            throw error
        }
    }
    async createAndSaveToken(user) {
        const token = uuidToken.generateToken()
        if (token) {
            try {
                await knex.insert({token, user_id: user[0].id}).into('tokens')
                return token
                
            } catch (error) {
                console.log(error)
                throw error
            }
        }
        else {
            err.default = 'erro no sistema'
            return {status: 500, err: err.default}
        }
    }
    async sendRecoveryEmail(user, token){
        const sent = await uuidToken.sendTokenByEmail(user, token)
        return sent
    }
    async generateToken(email) {
        let user = await this.findUsersDates(false, email)
        const { id, profileimg, emoji, username } = user[0]
        let token = jwt.sign({ id, email: email, profileimg, emoji, username }, secret, { expiresIn: '4d' })
        if (!token) {
            err.default = 'erro ao gerar o token'
            return {status:500, err: err.default}
        }
        return token
        
    }
    async auth (token) {
        let decoded 
        jwt.verify(token, secret, (err, token) =>{
            if (err) {
                return decoded = false
            }
            else {
                decoded = token
            }
        })
        return decoded

    }
    async searchName(name) {
        let found = false
        const userName = await knex.select('username').where({username: name}).table('users')
        userName.length > 0 ? found = true : found
        return found
        
    }
    async searchEmail(email) {
        let found = false
        const userEmail = await knex.select('email').where({ email: email }).table('users')
        userEmail.length > 0 ? found = true : found
        return found
    }
    async comparePassword(name, password){
        const user = await this.findUsersDates(name)
        let isRight = false
        if (user.length > 0) {
            isRight =  bcrypt.compare(password, user[0].password)
            return isRight
        }
        else {
            return isRight
        }
    }
    async emojiVerification(userName){
        const arrayGoblin = ['Paulo Ribas', 'paulobrasil33', 'Batata', 'batata', 'Bayaya', 'Batata_Shi','batata_shi', 'batata shi', 'Batata Shi']
        const arrayPleadingFace = ['Ovatsug', 'ovatsug', 'gustavozpo', 'Gustavozpo']
        const arrayInteligence = ['andi', 'Andí', 'andí', 'Andi', 'mabu', 'Mabu']
        const arrayAbacate = ['faf', 'fafo', 'Faf', 'Fafo']
        const arrayAlien = ['rari', 'Rari', 'nicolas', 'Nicolas']
        const arrayClow = ['baka', 'Baka', 'Gold']
        let emoji
        let japaneseGoblin = arrayGoblin.find(name => {
            return userName === name
        })
        let pleadingFace = arrayPleadingFace.find(name => {
            return userName === name
        })
        let Inteligence = arrayInteligence.find(name => {
            return userName === name
        })
        let Abacate = arrayAbacate.find(name => {
            return userName === name
        })
        let Alien = arrayAlien.find(name => {
            return userName === name
        })
        let Clow = arrayClow.find(name => {
            return userName === name
        })
        if (japaneseGoblin) return emoji = '&#128122'
        if (pleadingFace) return emoji = '&#129402'
        if (Inteligence) return emoji = '&#129488'
        if (Abacate) return emoji = '&#129361'
        if (Alien) return emoji = '&#128125'
        if (Clow) return emoji = '&#129313'
        if (emoji) {
            return emoji    
        }
        else {
            return 'false'
        }
    }
    async nameParse(userName){
        let nameSplit = userName.split(' ')
        let arrayForPush = []
        nameSplit.forEach(name => {
            if (name != '') arrayForPush.push(name)
        });
        let nameResolve = arrayForPush.join(' ')
        return new Promise((resolve, reject) => {
            resolve({nameResolved: nameResolve})
        })
    }
    async nameVerification(username, login) {
        let usernameString 
        isNaN(username) ? usernameString = username : usernameString = username.toString()
        let nameParse = await this.nameParse(usernameString) 
        usernameString = nameParse.nameResolved
        if (usernameString.split('').length < 3 || usernameString.split('').length > 50) {
            err.name = 'nome inserido com numero de caracteres inválidos'
            return {status:411, err: err.name }
            
        }
        let userNameVerification = usernameString.split('')
        let userNameWARN = 0
        let SqlInjection = 0
        userNameVerification.forEach(word => {
            if (word === '' || word === ' ') {
                userNameWARN += 1
            }
        });
        if (userNameWARN === usernameString.length) {
            err.name = 'nome de usuario inválido, preencha sem espaços vazios'
            return { status: 406, err: err.name }
        }
        else {
            userNameWARN = 0
            userNameVerification.forEach(word => {
                if (word === '=' || word === '-' || word === '?' || word === ';') {
                    SqlInjection += 1
                }
            });

        }
        if (SqlInjection > 0) {
            err.name = 'nome de usuario com  caracteres inválidos'
            return { status: 406, err: err.name }
        }
        try {
            const user = await this.findUsersDates(usernameString)
            if (user.length > 0 && !login) {
                err.name = 'esse nome já está sendo usado por outro usuario'
                return { status: 404, err: err.name }
            }
    
            return {succeed: true, userName: usernameString}
        }
        catch(error) {
            throw error
        }

    }    
    async emailVerification(email, login) {
        let emailString 
        isNaN(email) ? emailString = email : emailString = email.toString()
        if (emailString.split('').length < 4 || emailString.split('').length > 133) {
            err.email = 'email inserido com numero de caracteres inválidos'
            return {status:411,err: err.email }
        }

        let emailWarn = 0
        let emailAhoba = 0
        let SqlInjection = 0
        let emailVerification = emailString.split('')
        emailVerification.forEach(word => {
            if (word === '' || word === ' ') {
                emailWarn += 1
            }
        })

        if (emailWarn === emailString.length) {
            err.email = 'email inválido, preencha sem espaços vazios'
            return { status: 406, err: err.email }
        }
        emailVerification.forEach(word => {
            if (word === '=' || word === '-' || word === '?' || word === ';' || word === "(" || word === ")" || word === '"' || word === "'") {
                SqlInjection += 1
            }
            if (word === '@') {
                emailAhoba += 1
            }
        })

        if (SqlInjection > 0 || emailAhoba === 0 || emailAhoba > 1) {
            err.email = 'email com caracteres inválidos'
            return { status: 406, err: err.email }

        }
        try {
            const user = await this.findUsersDates(null, emailString)
            if (user.length > 0 && !login) {
                err.email = 'esse email já foi cadastrado por outro usuario'
                return { status: 406, err: err.email }
            }

            return { succeed: true }
        }
        catch (error) {
            throw error
        }
    }
    async passwordVerification(password) {
        let passwordToString
        isNaN(password) ? passwordToString = password : passwordToString = password.toString()
        if (passwordToString.split('').length < 4 || passwordToString.split('').length > 201) {
            err.password = 'senha inserida com numero de caracteres inválidos'
            return {status: 411, err: err.password}
        }
        let passwordWarn = 0
        let passwordVerification = passwordToString.split('')

        passwordVerification.forEach(word => {
            if (word === '' || word === ' ') {
                passwordWarn += 1
            }
        });

        if (passwordWarn === password.length) {
            err.password = 'senha inválida, preencha sem espaços vazios'
            return { status: 406, err: err.password }
          
        }
        return { succeed: true, safePassword: passwordToString }
    }

}

module.exports = new User