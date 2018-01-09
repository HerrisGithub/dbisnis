
exports.up = function(knex, Promise) {
    return knex.schema.createTable('bank', table=>{
        table.increments();
        table.string('username').notNullable().references('users.username').onUpdate('cascade').onDelete('cascade');
        table.string('bank_name');
        table.string('bank_branch');
        table.string('account_number');
        table.string('account_name');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTable('bank', table=>{
          
    })
    .then(function (){
    });
};
