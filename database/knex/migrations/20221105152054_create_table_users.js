/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id').primary();
            table.string('username', 50).notNullable().unique();
            table.string('password', 255).notNullable();
            table.string('email', 255).notNullable().unique();
            table.string('emoji', 20);
            table.integer('muted', 10);
            table.integer('role');
            table.integer('choice');
            table.string('profileimg', 255).notNullable().defaultTo('/default.png');
            table.text('description', 'longtext');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
            
        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
        return knex.schema.dropTable('users')
};
