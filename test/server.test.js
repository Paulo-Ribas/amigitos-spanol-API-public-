const app = require('../src/app')
const request = require('supertest')



test('Deve retornar aplication true', async ()=>{
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.aplication).toBeTruthy()

    
})