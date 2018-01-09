
exports.up = function(knex, Promise) {
    return knex.schema.createTable('rating', table=>{
        table.increments();
        table.integer('product_id')
             .notNullable().references('products.id').onUpdate('cascade').onDelete('cascade');
        table.text('review');
        table.string('rater')
                .notNullable().references('users.username').onUpdate('cascade').onDelete('cascade');
        table.string('product_by')
                .notNullable().references('users.username').onUpdate('cascade').onDelete('cascade');
        table.integer('star');

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTable('rating', table=>{
          
    })
    .then(function (){
    });
};
