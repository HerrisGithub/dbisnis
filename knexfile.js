var process = require('process');
  var config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  var knex = {
    client: 'pg',
    version: '9.6',
    connection: config,
    migrations: {
      tableName: 'migrations'
    },
    ssl:true
  };

  var knex=require('knex')(knex);

module.exports = {
  knex:knex,
  // development:development,
  // production:production
};
