// Update with your config settings.

var process = require('process');
  var config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.socketPath = '/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}';
  }

  // var Knex = require('knex');
  // var knex = Knex({
  //   client: 'postgresql',
  //   connection: config
  // });



  // var development= {
  //   // client: 'postgresql',
  //   // connection: {
  //   //   user:process.env.SQL_USER,
  //   //   password:process.env.SQL_PASSWORD,
  //   //   database:process.env.SQL_DATABASE,
  //   //   port:8989
  //   // },
  //   migrations: {
  //     tableName: 'migrations'
  //   },
  //   ssl:true,
  //   client: 'pg',
  //   connection: {
  //     port:8989,
  //     database:'direktoribisnis',
  //     user:'postgres',
  //     password:'postgres',
  //     host:'127.0.0.1'},
  // }

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
  var knex=require('knex')(config);

module.exports = {
  knex:knex,
  development:config,
  production:config
};
