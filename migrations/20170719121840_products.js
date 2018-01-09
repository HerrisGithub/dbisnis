
exports.up = function(knex, Promise) {
   return knex.schema.createTable('products', table=>{
		table.increments('id');
		table.string('permalink').unique();
		table.string('nama');
		table.string('kategori');
		table.string('deskripsi');
		table.json('fitur_umum');
		table.float('berat');
		table.boolean('posting');
		table.boolean('pre_order');
		table.float('ongkos_kirim');
		table.string('gambar');
		table.integer('kondisi');
		table.json('spesifikasi');
		table.integer('stok');
		table.string('product_by').references('users.username').onDelete('cascade').onUpdate('cascade');
		table.timestamp('created_at').defaultTo(knex.fn.now());
		table.timestamp('updated_at').defaultTo(knex.fn.now());
      
   })
  	.then(function(){
  		console.log('Table Products Berhasil ditambahkan!');
  	});
};

exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('products', table=>{
	  })
  	.then(function (){
  		console.log('Table Products Berhasil dihapus!');
  	});
};

