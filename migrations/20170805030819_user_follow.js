

exports.up = function(knex, Promise) {
   return knex.schema.createTable('user_follow', table=>{
        table.increments('id');
		table.string('follower')
		.notNullable().references('users.username').onDelete('cascade').onUpdate('cascade');;
        table.string('following').notNullable().references('users.username').onDelete('cascade').onUpdate('cascade');;
		table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
       
   })
  	.then(function(){
  		console.log('Table Pengguna Berhasil ditambahkan!');
  	});
};

exports.down = function(knex, Promise) {
  return knex.schema
  	.dropTable('user_follow', table=>{
	  })
  	.then(function (){
  		console.log('Table Pengguna Berhasil dihapus!');
  	});
};
