exports.up = function(knex, Promise) {
    return knex.schema.createTable('message_reply', table=>{
        table.increments('id');
        table.integer('message_id')
        .references('messages.id')
        .onDelete('cascade')
        .onUpdate('cascade');

        table.string('subject');
        table.string('creator')
        .notNullable()
        .references('users.username')
        .onDelete('cascade')
        .onUpdate('cascade');
        table.text('message_body');

        table.integer('is_read');
         table.timestamp('created_at').defaultTo(knex.fn.now());
         table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
       .then(function(){
           console.log('Table Pengguna Berhasil ditambahkan!');
       });
 };
 
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('message_reply', table=>{
       })
       .then(function (){
           console.log('Table Pengguna Berhasil dihapus!');
       });
 };
 