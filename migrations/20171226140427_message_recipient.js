exports.up = function(knex, Promise) {
    return knex.schema.createTable('message_recipient', table=>{
         table.increments('id');
         table.string('recipient')
         .notNullable()
         .references('users.username')
         .onDelete('cascade')
         .onUpdate('cascade');
         
         table.integer('message_id')
         .notNullable()
         .references('messages.id')
         .onDelete('cascade')
         .onUpdate('cascade');
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
       .dropTable('message_recipient', table=>{
       })
       .then(function (){
           console.log('Table Pengguna Berhasil dihapus!');
       });
 };
 