exports.up = function(knex, Promise) {
    return knex.schema.createTable('grosir', table=>{
        table.increments();
        table.integer('product_id').references('products.id').onDelete('cascade').onUpdate('cascade');
        table.integer('variasi_id').references('variasi.id').onDelete('cascade').onUpdate('cascade');
        table.string('min');
        table.float('max');
        table.integer('satuan');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
     })
       .then(function(){
       });
 };
  
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('grosir', table=>{
             
       })
       .then(function (){
       });
 };
 