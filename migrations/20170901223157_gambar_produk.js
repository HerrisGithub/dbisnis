exports.up = function(knex, Promise) {
    return knex.schema.createTable('gambar_produk', table=>{
        table.increments();
        table.integer('product_id').references('products.id').onDelete('cascade').onUpdate('cascade');;
        table.string('gambar');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
     })
       .then(function(){
       });
 };
  
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('gambar_produk', table=>{
             
       })
       .then(function (){
       });
 };
 