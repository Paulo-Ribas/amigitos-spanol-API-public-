const path = require('path')
 
require('dotenv').config()

let knex = require('knex')({
    client:'mysql2',
    connection:{
        host: '127.0.0.1',
        user: 'root',
        password: process.env.DB_PASS,
        database:'usuarios'
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: path.join(__dirname,'/', 'migrations')
    }
});

module.exports = knex
