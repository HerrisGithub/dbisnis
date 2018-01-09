exports.up = function(knex, Promise) {
    return knex.schema.createTable('promosi', table=>{
        table.increments('id');
        table.string('kode_promosi');
        table.integer('product_id').references('products.id').onDelete('cascade').onUpdate('cascade');;
        table.float('persen');
        table.integer('min');
        table.integer('max');
        table.float('max_diskon');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
     })
       .then(function(){
       });
 };
  
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('promosi', table=>{
             
       })
       .then(function (){
       });
 };
 