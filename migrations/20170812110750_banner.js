exports.up = function(knex, Promise) {
   return knex.schema.createTable('banner', table=>{
       table.increments();
       table.string('title');
       table.string('image');
       table.string('permalink').unique();
       table.boolean('featured');
       table.string('create_by').references('admin_account.username').onUpdate('cascade').onDelete('cascade');
       table.timestamp('created_at').defaultTo(knex.fn.now(	));
       table.timestamp('updated_at').defaultTo(knex.fn.now());
       
    })
  	.then(function(){
          
  	});
};
 
exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('banner', table=>{
		    
	  })
  	.then(function (){
  	});
};
