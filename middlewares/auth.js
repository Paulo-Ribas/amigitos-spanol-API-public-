const userModel = require('../model/user')
const err = require('../controllers/errs/userErrs')
 
module.exports = async function auth(req, res, next) {
        let authorization = req.headers['authorization'] || req.headers['cookie']
        if(!authorization) {
            err.default = 'logue para acessar'
            res.status(401).send({ err: err.default, token: authorization })
            return
        }
        let  tokenSplit = authorization.split(' ')
        if(tokenSplit.length === 1) {
            tokenSplit = authorization.split('%20')
        }
        const token = tokenSplit[1]
        if (token) {
            const permission = await userModel.auth(token)
            if (permission) {
                req.body.tokenDecoded = permission
                return next()
            }
            else {
                console.log(token, 'e aqui?')
                err.default = 'logue para acessar'
                res.status(401).send({err: err.default, token: token})
            }
        }
        else {
            err.default = 'logue para acessar'
            res.status(402).send({ err: err.default })
        }



}