
exports.up = function(knex, Promise) {
   return knex.schema.createTable('orders', table=>{
        table.increments('id');
		table.string('email');
        table.string('name');   
        table.string('address');
        table.string('province');
        table.string('district');
        table.string('sub_district');
        table.string('postal_code');
        table.string('order_date');
        table.boolean('verification');
        table.json('bank_account');
        table.string('transfer_note');
        table.float('orders_total');
        table.boolean('payment_status');
        table.string('buyer').notNullable().references('users.username')
        .onDelete('cascade').onUpdate('cascade');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
   })
  	.then(function(){
  		console.log('Table Pengguna Berhasil ditambahkan!');
  	});
};

exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('orders', table=>{
	  })
  	.then(function (){
  		console.log('Table Pengguna Berhasil dihapus!');
  	});
};
function newFunction() {
    // #region
    'asas';
}

