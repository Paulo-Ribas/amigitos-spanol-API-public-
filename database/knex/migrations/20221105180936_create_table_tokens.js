/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('tokens', (table) => {
        table.increments('id').primary()
        table.string('token', 250).unique()
        table.integer('used', 10)
        table.integer('user_id', 10).unsigned()
      table.foreign('user_id').references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE')

    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('token')
};
