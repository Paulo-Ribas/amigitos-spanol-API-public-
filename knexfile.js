// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 * 
 */
require('dotenv').config()
module.exports = {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: process.env.DB_PASS,
      database: 'usuarios'
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/knex/migrations'
    }

};
