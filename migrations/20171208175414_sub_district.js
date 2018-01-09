exports.up = function(knex, Promise) {
    return knex.schema.createTable('sub_district', table=>{
        table.increments('id');
        table.integer('district_id');
        table.string('sub_district');
        table.string('zip_code');
        
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
     })
       .then(function(){
       });
 };
  
 exports.down = function(knex, Promise) {
   return knex.schema
       .dropTable('sub_district', table=>{
             
       })
       .then(function (){
       });
 };
 