const userModel = require('../model/user')
const err = require('./errs/userErrs.js')

class homeController {
    async index(req, res){
        res.status(200).send({aplication: true})
        return
    }
    async validate(req, res) {
        const decoded = req.body.tokenDecoded
        if (decoded) {
            res.status(200).send({dates: decoded})
            return
            
        }
        else {
            res.sendStatus(404)
            return
        }
    }
}

module.exports = new homeController