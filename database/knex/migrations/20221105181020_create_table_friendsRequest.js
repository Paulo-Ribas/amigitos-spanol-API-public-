/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('friendrequest', (table) => {
            table.increments('id').primary()
            table.integer('user_id', 10).unsigned()
            table.foreign('user_id').references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE')
            table.integer('friend_id', 10).unsigned()
            table.foreign('friend_id').references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE')

        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('friendsRequest')
};
