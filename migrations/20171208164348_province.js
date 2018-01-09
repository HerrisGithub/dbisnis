exports.up = function(knex, Promise) {
    return knex.schema.createTable('province', table=>{
        table.increments('id');
        table.string('provinsi');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
     })
       .then(function(){
       });
 };
  
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('province', table=>{
             
       })
       .then(function (){
       });
 };
 