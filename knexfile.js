var process = require('process');
  var config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  var production= {
    client: 'postgresql',
    connection: config,
    migrations: {
      tableName: 'migrations'
    },
    ssl:true
  }

  var knex=require('knex')(production);

module.exports = {
  knex:knex,
  // development:development,
  // production:production
};
