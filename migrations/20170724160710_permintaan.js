exports.up = function(knex, Promise) {
   return knex.schema.createTable('permintaan', table=>{
       table.increments();
       table.string('name');
       table.integer('kuantitas');
       table.string('satuan');
       table.integer('harga');
       table.text('desc');
       table.string('province');
       table.string('address');
       table.string('lampiran')
       table.string('create_by').references('users.username').onUpdate('cascade').onDelete('cascade');
       table.string('district');
       table.string('sub_district');
       table.integer('zip_code');
       table.integer('status');
       table.string('kategori');
       table.timestamp('created_at').defaultTo(knex.fn.now(	));
       table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
  	.then(function(){
          
  	});
};
 
exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('permintaan', table=>{
		    
	  })
  	.then(function (){
  	});
};
