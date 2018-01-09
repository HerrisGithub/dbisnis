exports.up = function(knex, Promise) {
    return knex.schema.createTable('chat_room', table=>{
         table.increments('id');
         table.string('user1').references('users.username').onDelete('cascade').onUpdate('cascade');
         table.string('user2').references('users.username').onDelete('cascade').onUpdate('cascade');
         table.timestamp('created_at').defaultTo(knex.fn.now());
         table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
       .then(function(){
           console.log('Table Pengguna Berhasil ditambahkan!');
       });
 };
 
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('chat_room', table=>{
       })
       .then(function (){
           console.log('Table Pengguna Berhasil dihapus!');
       });
 };
 