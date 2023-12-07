const app = require('../src/app')
const request = require('supertest')
jest.setTimeout(30000)
let date = Date.now()
const PauloRibas = { username: 'Paulo Ribas 2019', email: 'paulinho.gremio33@gmail.com', password: 'doctorwhoislife3'}
let DateString = date.toString()
let emailUnique = `paulo13paulo${DateString}@gmail.com`
let mainUser = { username: `paulobrasil33DateString331` + DateString, email: DateString +  emailUnique, password: '333333'}
beforeAll(()=> {
    request(app).post('/sign').send(mainUser).then(res => {
        expect(res.status).toBe(200)
    }).catch(erro => {
        throw erro
    })
})
describe('cadastro de usuario', ()=> {
    test('deve falhar ao cadastrar o nome do usuario por causa de caracteres inválidos', async()=>{
        const res = await request(app).post('/sign').send({username: "'admin--", email: emailUnique, password: 'secreta12345'})
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao cadastrar o nome do usuario por causa de espaços vazios', async()=> {
        const res = await request(app).post('/sign').send({username: '   ',email: emailUnique,password:'sadasds'})
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao cadastrar o nome de usuario por conta de nome duplicado', async() => {
        const res = await request(app).post('/sign').send({username: 'Paulo Ribas',email:emailUnique,password:'sadas'})
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao cadastrar o email por causa de caracteres inválios', async()=> {
        const res = await request(app).post('/sign').send({username:DateString,email:emailUnique + "'--",password: '32423423'})
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao cadastrar o email por causa de espaços vazios', async()=> {
        const res = await request(app).post('/sign').send({username:DateString,email:'    ',password: '324324'})
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao cadastrar o email com dois @', async()=> {
        const res = await request(app).post('/sign').send({username: DateString,email:emailUnique + '@',password: '232313'})
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao cadastrar o email sem nenhum @', async()=> {
        const res = await request(app).post('/sign').send({username:DateString,email:'paulo13.com.br',password:'3324234'})
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao cadastrar a senha por causa de espaços vazios', async()=> {
        const res = await request(app).post('/sign').send({username:DateString,email: emailUnique,password:'    '})
        expect(res.body.err).toBeTruthy()
    })
    test('deve cadastrar um usuario com sucesso', async()=> {
        const res = await request(app).post('/sign').send(mainUser)
        expect(res.statusCode).toBe(200)
    })
    test('deve falhar ao cadastrar um usuaria com dados de uma letra', async() => {
        const res = await request(app).post('/sign').send({username: 'p', email: 'a', password: 'u' })
        expect(res.statusCode).toBeGreaterThan(399)
    })
    test('deve falhar ao cadastrar o usuario com um caractere vazio', async()=> {
        const res = await request(app).post('/sign').send({ username: '', email: '', password: '' })
        expect(res.statusCode).toBeGreaterThan(399)
    })
    test('deve receber todos os usuarios', async () => {
        const res = await request(app).get('/users')
        expect(res.statusCode).toBe(200)
    })
})

describe('login de usuario', ()=> {
    test('deve falhar ao logar o nome do usuario por causa de caracteres inválidos', async () => {
        const res = await request(app).post('/login').send({ username: "'admin--", email: emailUnique, password: 'secreta12345' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao logar o nome do usuario por causa de espaços vazios', async () => {
        const res = await request(app).post('/login').send({ username: '   ', email: emailUnique, password: 'sadasds' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao logar o nome de usuario por conta de nome duplicado', async () => {
        const res = await request(app).post('/login').send({ username: 'Paulo Ribas', email: emailUnique, password: 'sadas' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao logar o email por causa de caracteres inválios', async () => {
        const res = await request(app).post('/login').send({ username: DateString, email: emailUnique + "'--", password: '32423423' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao logar o email por causa de espaços vazios', async () => {
        const res = await request(app).post('/login').send({ username: DateString, email: '    ', password: '324324' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao logar o email com dois @', async () => {
        const res = await request(app).post('/login').send({ username: DateString, email: emailUnique + '@', password: '232313' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao logar o email sem nenhum @', async () => {
        const res = await request(app).post('/login').send({ username: DateString, email: 'paulo13.com.br', password: '3324234' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve falhar ao logar a senha por causa de espaços vazios', async () => {
        const res = await request(app).post('/login').send({ username: DateString, email: emailUnique, password: '    ' })
        expect(res.body.err).toBeTruthy()
    })
    test('deve logar um usuario com sucesso', async () => {
        const res = await request(app).post('/login').send(mainUser)
        expect(res.statusCode).toBe(200)
        expect(res.body.token).toBeDefined()
    })
    test('deve falhar ao logar um usuaria com dados de uma letra', async () => {
        const res = await request(app).post('/login').send({ username: 'p', email: 'a', password: 'u' })
        expect(res.statusCode).toBeGreaterThan(399)
    })
    test('deve falhar ao logar o usuario com um caractere vazio', async () => {
        const res = await request(app).post('/login').send({ username: '', email: '', password: '' })
        expect(res.statusCode).toBeGreaterThan(399)
    })
    /* test('deve autenticar um usuario logado', async() => {
        return request(app).post('/login').send(mainUser).then(async res => {
            const config = {
                headers: {
                    Authorization: 'Bearer ' + res.body.token
                }
            }
            try {
                const res_1 = await request(app).post('/validate').set('authorization', config.headers.Authorization)
                expect(res_1.status).toBe(200)
                expect(res_1.body.email).toBeTruthy()
            } catch (e) {
                throw e
            }
          
        }).catch(e => {
            throw e
        })
    }) */
describe('modificação de dados de usuarios', ()=> {
    test("deve editar o nome de um usuario", async ()=> {
        return request(app).post('/login').send(mainUser).then(async res => {
            const config = {
                headers: {
                    Authorization: 'Bearer ' + res.body.token
                }
            }
            try {
                let res = await request(app).put('/username').send({ username: 'aladin' + DateString }).set('authorization', config.headers.Authorization)
                expect(res.status).toBe(200)
            } catch (e) {
                throw e
            }

        }).catch(e => {
            throw e
        })  

    })
    test("deve editar o email de um usuario", async () => {
        return request(app).post('/login').send(mainUser).then(async res => {
            const config = {
                headers: {
                    Authorization: 'Bearer ' + res.body.token
                }
            }
            try {
                let res = await request(app).put('/email').set('authorization', config.headers.Authorization).send({ email: 'aladin@.com' + DateString })

                expect(res.status).toBe(200)
            } catch (e) {
                throw e
            }

        }).catch(e => {
            throw e
        })  
    })
    test("deve editar a senha de um usuario", async () => {
        return request(app).post('/login').send(mainUser).then(async res => {
             
            const config = {
                headers: {
                    Authorization: 'Bearer ' + res.body.token
                }
            }
            try {
                let res = await request(app).put('/password').set('authorization', config.headers.Authorization).send({ password: 'aladin' + DateString })

                expect(res.status).toBe(200)
            } catch (e) {
                throw e
            }

        }).catch(e => {
            throw e
        })  

    })
    
})

describe('geração de token de recuperação de senha', ()=> {
    test('deve receber um token', async () => {
        const res = await request(app).post('/forgetedpass').send({email: PauloRibas.email})
        expect(res.status).toBe(200)

    })
   /*  test('deve alterar a senha pelo token', async() => {
        const res = await request(app).put('/changepasswordbytoken').send({ email: PauloRibas.email, password: 'hulkesmaga3vezes', token: '34ebbc88-dd6f-40f1-9c2b-4853bdc3f797'})
        expect(res.status).toBe(200)
    }) */
})

})