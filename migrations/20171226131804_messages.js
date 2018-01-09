exports.up = function(knex, Promise) {
    return knex.schema.createTable('messages', table=>{
         table.increments('id');
         table.string('subject');
         table.string('creator')
         .notNullable()
         .references('users.username')
         .onDelete('cascade')
         .onUpdate('cascade');
         table.text('message_body');
         table.timestamp('created_at').defaultTo(knex.fn.now());
         table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
       .then(function(){
           console.log('Table Pengguna Berhasil ditambahkan!');
       });
 };
 
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('messages', table=>{
       })
       .then(function (){
           console.log('Table Pengguna Berhasil dihapus!');
       });
 };
 