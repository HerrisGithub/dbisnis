exports.up = function(knex, Promise) {
    return knex.schema.createTable('district', table=>{
        table.increments('id');
        table.integer('province_id');
        table.string('district');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
     })
       .then(function(){
       });
 };
  
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('district', table=>{
             
       })
       .then(function (){
       });
 };
 