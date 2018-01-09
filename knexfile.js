// Update with your config settings.

  var development= {
    client: 'postgresql',
    connection: {
      user:process.env.SQL_USER,
      password:process.env.SQL_PASSWORD,
      database:process.env.SQL_DATABASE,
      host:'104.154.29.255'
    },
    migrations: {
      tableName: 'migrations'
    },
    ssl:true,
  //   client: 'pg',
  //   connection: {
  //     port:8989,
  //     database:'direktoribisnis',
  //     user:'postgres',
  //     password:'postgres',
  //     host:'127.0.0.1'},
  // }
  }

  // var production= {
  //   client: 'postgresql',
  //   connection: process.env.DATABASE_URL,
  //   migrations: {
  //     tableName: 'migrations'
  //   },
  //   ssl:true
  // }
  // var production= {
  //   client: 'postgresql',
  //   connection: {
  //     user:process.env.SQL_USER,
  //     password:process.env.SQL_PASSWORD,
  //     database:process.env.SQL_DATABASE
  //   },
  //   migrations: {
  //     tableName: 'migrations'
  //   },
  //   ssl:true
  // }
  var knex=require('knex')(development);

module.exports = {
  knex:knex,
  // development:development,
  // production:production
};
