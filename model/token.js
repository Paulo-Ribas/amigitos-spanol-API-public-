const UUID = require('uuid')
const knex = require('../database/knex/connection')
const err = require('../controllers/errs/userErrs')
const path = require('path')
const nodemailer = require('nodemailer')
const mjml = require('mjml')
const dir = path.join(__dirname, '../', 'attachments', 'img', 'background.jpg')

class Token  {
    generateToken(){
        let token = UUID.v4()
        return token
    }
    async findToken(token){
        try {
            let userToken = await knex.select('*').from('tokens').where({token:token})
            if (userToken.length > 0) {
                return userToken[0]
            }
            else {
                err.default = 'token não encontrado'
                return {status: 400, err: err.default}
            }

        }
        catch(erro) {
            throw erro
        }
    }
    generateHtmlmail(token){
        const html = mjml(`
        <mjml>
            <mj-body>
                <mj-hero mode="fixed-height" height="469px" background-width="600px" background-height="469px" background-url="https://images5.alphacoders.com/101/1010058.jpg" background-color="#393275" padding="100px 0px">
                <mj-text padding="15px" color="#ffffff" font-family="cursive" align="center" font-size="27px" line-height="30px" font-weight="900">
                                                                RECUPERAÇÃO DE CONTA
                    </mj-text>
                    <mj-button href="https://AMIGITOS-ESPANOL-Y-SLA.COM.BR/login/recoverypass/${token}" align="center" background-color="#01103142" font-size="17px", color="white", border-radius="10px">
                                    Clique Aqui
                    </mj-button>
                </mj-hero>
            </mj-body>
        </mjml>
        `)
        return html.html
    }
    async sendTokenByEmail(user, token){
        let html = this.generateHtmlmail(token)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'amigitosespanolysla@gmail.com',
                pass: 'bmjbvovpjroqpgbr'
            },



        })
        try {
            const sent = await transporter.sendMail({
                from: 'Paulo Ribas <amigitosespanolysla@gmail.com>',
                to: `${user[0].email}`,
                subject: 'com amor e carinho',
                text: 'eu te amo muito',
                html: html
               /*  html: `<img src=""cid:paulo13paulo423@gmail.com></img> <div class="container"><h1 style="color: white;">Recuperação De Conta</h1><a href="https://AMIGITOS-ESPANOL-Y-SLA.COM.BR/login/recoverypass/${token}">clique</a></div>`, */
            })
            return sent
        } catch (error) {
             console.log(error)
            throw error
        }
    }
    async setUsed(token){
        try {
            await knex.select('*').from('tokens').where({token: token}).update({used: 1})
        } catch (error) {
            throw error
        }
    }
}

module.exports = new Token