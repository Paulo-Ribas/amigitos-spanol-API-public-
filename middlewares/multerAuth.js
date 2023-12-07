const userModel = require('../model/user')
const err = require('../controllers/errs/userErrs')

module.exports = async function auth(req, res, next) {
    let authorization = req.headers['authorization']
    if (!authorization) {
        err.default = 'logue para acessar'
        res.status(401).send({ err: err.default, token: authorization })
        return
    }
    const tokenSplit = authorization.split(' ')
    const token = tokenSplit[1]
    if (token) {
        const permission = await userModel.auth(token)
        if (permission) {
            return next()
        }
        else {
            err.default = 'logue para acessar'
            res.status(401).send({ err: err.default, token: token })
        }
    }
    else {
        err.default = 'logue para acessar'
        res.status(402).send({ err: err.default })
    }

}
