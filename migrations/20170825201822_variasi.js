exports.up = function(knex, Promise) {
    return knex.schema.createTable('variasi', table=>{
        table.increments();
        table.integer('product_id').references('products.id').onDelete('cascade').onUpdate('cascade');
        table.string('nama');
        table.float('harga');
        table.integer('stok');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
     })
       .then(function(){
       });
 };
  
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('variasi', table=>{
             
       })
       .then(function (){
       });
 };
 