exports.up = function(knex, Promise) {
   return knex.schema.createTable('pembeli', table=>{
       table.increments();
       table.string('username').unique().references('users.username').onUpdate('cascade').onDelete('cascade');
       table.boolean('gender');
       table.date('birth');
       table.string('phone');
       table.string('photo');
       table.string('province');
       table.string('district');
       table.string('postal_code');
       table.string('sub_district');
       table.string('address');
     
    })
  	.then(function(){
          
  	});
};
 
exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('pembeli', table=>{
		    
	  })
  	.then(function (){
  	});
};
