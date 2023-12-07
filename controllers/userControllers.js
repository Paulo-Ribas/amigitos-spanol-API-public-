const userModel = require('../model/user')
const err = require('./errs/userErrs.js')
const uuidToken = require('../model/token')
const aws = require("@aws-sdk/client-s3")
const image = require('../model/image')

let S3 = new aws.S3()

class Controller {
    async newUser(req, res) {
        let { username, email, password } = req.body
        if (username != undefined && email != undefined && password != undefined) {
            const userVerification = await userModel.nameVerification(username)
            const emailVerification = await userModel.emailVerification(email)
            const passwordVerification = await userModel.passwordVerification(password)

            if (userVerification.err) {
                 
                res.status(userVerification.status).send({ err: userVerification.err })
                return
            }
            if (emailVerification.err) {
                res.status(emailVerification.status).send({ err: emailVerification.err })
                return
            }
            if (passwordVerification.err) {
                res.status(passwordVerification.status).send({ err: passwordVerification.err })
                return
            }
            if (userVerification.succeed && emailVerification.succeed && passwordVerification.succeed) {
                try {
                    await userModel.saveUser(userVerification.userName, email, passwordVerification.safePassword)
                    res.sendStatus(200)
                    return
                }
                catch (error) {
                    return res.status(500).send({ erro: 'ocorreu um erro' })
                }
            }
            else {
                res.status(400).send({ err: 'não foi possivel concluir a ação' })
            }
        }
        else {
            err.default = 'preencha todos os campos'
            res.status(400).send({ err: err.default })
            return
        }
    }
    async getUser(req, res) {
        let id = req.params.id
        let user = await userModel.findUserById(id)
        if (user.length > 0) {
            res.status(200).send({ user: user })
            return

        }
        else {
            res.status(404).send({ err: 'um erro ocorreu no meu servidor' })
        }
    }
    async getUsers(req, res) {
        const users = await userModel.findUsers()

        if (users.length > 0) {

            res.status(200).send({ users: users })
            return

        }
        else {
            res.status(404).send({ err: 'um erro ocorreu no meu servidor' })
            return
        }
    }
    async Login(req, res) {
        const { username, email, password } = req.body
        if (username != undefined && email != undefined && password != undefined) {
            try{
                const userNameVerification = await userModel.nameVerification(username, true)
                const emailVerification = await userModel.emailVerification(email, true)
                const passwordVerification = await userModel.passwordVerification(password, true)
    
                if (userNameVerification.err) {
                    res.status(userNameVerification.status).send({ err: userNameVerification.err })
                    return
                }
                if (emailVerification.err) {
                    res.status(emailVerification.status).send({ err: emailVerification.err })
                    return
                }
                if (passwordVerification.err) {
                    res.status(passwordVerification.status).send({ err: passwordVerification.err })
                    return
                }
                let user = await userModel.findUsersDates(username)
                if (user.length > 0) {
                    let userDates = user[0]
                    if (userDates.email === email) {
                        let isRight = await userModel.comparePassword(username, passwordVerification.safePassword)
                        if (isRight) {
                            let token = await userModel.generateToken(email)
                            if (token.err) {
                                res.status(token.status).send({ err: token.err })
                                return
                            }
                            res.status(200).send({ token: token })
                            return
                        }
                        else {
                            err.senha = 'senha incorreta'
                            res.status(400).send({ err: err.senha })
                        }
                    }
                    else {
                        err.email = 'email incorreto'
                        res.status(400).send({ err: err.email })
                        return
                    }
                }
                else {
                    err.name = 'esse nome de usuario não existe'
                    res.status(400).send({ err: err.name })
                    return
                }

            }
            catch(error){
                console.log(error)
                res.status(500).send({err: 'erro no servidor'})
            }

        }
        else {
            err.default = 'preencha todos os campos'
            res.status(400).send({ err: err.default })
            return
        }

    }
    async changeUserName(req, res) {
        let username = req.body.username
        let id = req.body.tokenDecoded.id
        let email = req.body.email
        let succeed = await userModel.nameVerification(username, false)
        if (succeed.succeed) {
            try {
                let changed = await userModel.editName(id, username, email)
                 
                if (changed) {
                    res.status(200).send({token: changed})
                    return
                }
                else {
                    res.status(400).send('não foi mudado lol')
                }
            } catch (error) {
                res.status(400).send({ err: 'não foi possivel concluir a ação' })

            }
        }
        else {
            res.status(succeed.status).send(succeed.err)
        }
    }
    async changeEmail(req, res) {
        let email = req.body.email
        let newEmail = req.body.newEmail
        let id = req.body.tokenDecoded.id
        let succeed = await userModel.emailVerification(newEmail, false)
        if (succeed.succeed) {
            try {
                let token = await userModel.editEmail(id, newEmail)
                if (token) {
                    res.status(200).send({token: token})
                    return
                }
                else {
                    res.sendStatus(400)
                }
            } catch (error) {
                res.status(400).send({ err: 'não foi possivel concluir a ação' })
            }
        }
        else {
            res.status(succeed.status).send(succeed.err)
        }
    }
    async changePassword(req, res) {
        let password = req.body.password
        let id = req.body.tokenDecoded.id
        let succeed = await userModel.passwordVerification(password)
        console.log(succeed)
        if (succeed.succeed) {
            try {
                let token = await userModel.editPassword(id, succeed.safePassword)
                if (token) {
                    res.status(200).send({token: token})
                    return
                }
                else {
                    console.log(succeed, 'o erroão')
                    res.status(400).send({ err: 'nao foi possivel editar a senha' })
                }
            } catch (error) {
                console.log(error, 'o erroão')
                res.status(400).send({ err: 'não foi possivel concluir a ação' })
            }
        }
        else {
            res.status(succeed.status).send(succeed.err)
        }
    }
    async recoveryPassword(req, res) {
        const email = req.body.email
        const user = await userModel.findUsersDates(undefined, email)
        if (user.length > 0) {
            try {
                const tokenCreated = await userModel.createAndSaveToken(user)
                if (!tokenCreated.err) {
                    try {
                        let sent = await userModel.sendRecoveryEmail(user, tokenCreated)
                         
                        if (sent) {
                            res.status(200).send({})
                            return
                        }
                        else {
                            err.default = 'ocorreu um erro no envio, tente novamente mais tarde ou então reporte o erro'
                            res.status(500).send({ err: err.default })
                            return
                        }
                    }
                    catch(error){
                        err.default = 'ocorreu um erro no envio, tente novamente mais tarde ou então reporte o erro'
                        res.status(500).send({err: err.default})
                        return 
                    }
                }
                else {
                    res.status(tokenCreated.status).send({ err: tokenCreated.err })
                    return
                }
            }
            catch (error) {
                res.status(400).send({ err: 'não foi possivel concluir a ação' })
            }

        }
        else {
            err.email = 'email informado não existe'
             
            res.status(400).send({ err: err.email })
        }

    }
    async changePasswordByToken(req, res) {
        const { email, password } = req.body
        const token = req.params.token
        let emailVerify = await userModel.emailVerification(email, true)
        let passwordVerify = await userModel.passwordVerification(password)
        if (emailVerify.err) return res.status(emailVerify.status).send({err: emailVerify.err})
        if (passwordVerify.err) return res.status(passwordVerify.status).send({ err: passwordVerify.err })
        let tokenFound = await uuidToken.findToken(token)
        if (!tokenFound.err) {
            try {
                let user = await userModel.findUsersDates(false, email)
                if (user.length > 0) {
                    let userId = user[0].id
                    if (userId === tokenFound.user_id) {
                        if (tokenFound.used < 1) {
                            try {
                                await userModel.editPassword(userId, password, email)
                                await uuidToken.setUsed(tokenFound.token)

                                res.sendStatus(200)
                                return

                            } catch (error) {
                                res.status(400).send({ err: 'não foi possivel concluir a ação' })
                            }

                        }
                        err.token = 'token já usado'
                        res.status(400).send({ err: err.token })
                        return
                    }
                    err.token = 'esse token não pertence a você'
                    res.status(400).send({ err: err.token })
                    return
                }
                else {
                    err.email = 'email incorreto'
                    res.status(400).send({ err: err.email })
                    return
                }
            } catch (error) {
                res.status(400).send({ err: 'não foi possivel concluir a ação' })
            }

        }
        else {
            res.status(tokenFound.status).send({ err: tokenFound.err })
            return
        }
    }
    async editImg(req, res) {
        const userID = req.body.tokenDecoded.id
         console.log('chegou a vir aqui?', userID)
        if (!userID) {
            res.status(400).send({ err: 'faça login para upload de arquivos' })
            return
        }
        let key = req.file.key // vou substituir essa parte do caminho pela key, visto que a location substitui caracteres da key, porém a url funciona mesmo quando coloco esses caracteres especificos substituidos, e posso usar essa parte para deletar a imagem depois que mudam ela, pois ela é a key de qualquer forma 
        let imgUrlSplitDomino = req.file.location.split('/').slice(0, 3)
         
        let imgUrl = 'https://degat35nfrv76.cloudfront.net/' + key
        console.log('gerou a img', imgUrl)
        try {
            console.log('vai pegar a imagem')
            let arrayUser = await image.getUserImgUrl(userID)
            console.log('pegou', arrayUser)
            let oldImgUrl = arrayUser[0].profileimg
            if (oldImgUrl != '/default.png') {
                oldImgUrl = oldImgUrl.split('/')[3]
                 
                let oldImgUrlFix = oldImgUrl.split(' ').join('-')
                S3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET_IMG, Key: oldImgUrl }, async (err, data) => {
                    if (err) {
                        console.log('chegou a vir aqui? console do erro', err)

                        return res.status(500).send({ err: 'não foi possivel mudar a imagem' })
                    }
                    try {
                        const token = await userModel.editImgProfile(userID, imgUrl)
                        if (token) {
                            res.status(200).send({ msg: 'imagem mudada lol', imagem: imgUrl, token: token })
                            return
                        }
                        else {
                            res.sendStatus(402)
                        }
                    }
                    catch (error) {
                        console.log(error, 'veio aqui lol')
                        res.status(500).send({ err: error })
                    }
                })
            }
            else {
                try {
                    const token = await userModel.editImgProfile(userID, imgUrl)
                    if (token) {
                        res.status(200).send({ msg: 'imagem mudada lol', imagem: imgUrl, token: token })
                        return
                    }
                    else {
                        res.sendStatus(402)
                    }
                }
                catch (error) {
                    console.log('um grande erro que era para aparecer lá pelo menos', error)
                    res.status(500).send({ err: error })
                }

            }
            
        } catch (error) {
             
            res.status(500).send({err: error})
        }
    }
    async editDescription(req, res) {
        let { description} = req.body
        let userId = req.body.tokenDecoded.id
        try {
            let user = await userModel.findUserById(userId)
            if(!user) return res.status(404).send({err: 'usuario não foi encontrado'})

            if(description.length <= 3333) {
                await userModel.saveDescription(description, userId)
                res.status(200).send({description})
            }
            else return res.status(406).send({err: 'caracteres ultrapassaram o limite'})

        } catch (error) {
            res.status(500).send({err: error})
        }
    }
    
}

module.exports = new Controller