exports.up = function(knex, Promise) {
    return knex.schema.createTable('chats', table=>{
         table.increments('id');
         table.integer('room_id').notNullable().references('chat_room.id').onDelete('cascade').onUpdate('cascade');
         table.string('creator').notNullable().references('users.username').onDelete('cascade').onUpdate('cascade');
         table.string('receiver').notNullable().references('users.username').onDelete('cascade').onUpdate('cascade');
         table.text('message_body');
         table.string('lampiran');
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
       .dropTable('chats', table=>{
       })
       .then(function (){
           console.log('Table Pengguna Berhasil dihapus!');
       });
 };
 