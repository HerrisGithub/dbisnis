exports.up = function(knex, Promise) {
   return knex.schema.createTable('penawaran', table=>{
       table.increments();
       table.integer('id_permintaan').references('permintaan.id').onUpdate('cascade').onDelete('cascade');
       table.string('jenis_produk');
       table.string('nama_produk');
       table.text('desc');
       table.integer('kuantitas');
       table.string('satuan');
       table.integer('status');
       table.integer('harga');
       table.integer('product_id').references('permintaan.id').onUpdate('cascade').onDelete('cascade');
       table.string('create_by').references('users.username').onUpdate('cascade').onDelete('cascade');
       
    })
  	.then(function(){
          
  	});
};
 
exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('penawaran', table=>{
		    
	  })
  	.then(function (){
  	});
};
