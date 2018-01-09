exports.up = function(knex, Promise) {
   return knex.schema.createTable('penjual', table=>{
       table.increments();
       table.string('username').references('users.username')
       .onUpdate('cascade').onDelete('cascade');;
       table.boolean('gender');
       table.string('photo'); 
       table.string('province');
       table.string('district');
       table.string('postal_code');
       table.string('sub_district');
       table.string('address');
       table.string('phone');
       table.string('company_name');
       table.text('company_desc');
       table.string('account_number');
       table.string('bank_name');
       table.string('bank_branch');
       table.string('account_name');
       table.timestamp('created_at').defaultTo(knex.fn.now(	));
		table.timestamp('updated_at').defaultTo(knex.fn.now());
       
    })
  	.then(function(){
          
  	});
};
 
exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('penjual', table=>{
		    
	  })
  	.then(function (){
  	});
};
