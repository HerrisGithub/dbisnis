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

  var knex = Knex({
    client: 'postgresql',
    connection: config
  });

  var knex=require('knex')(knex);

module.exports = {
  knex:knex,
  // development:development,
  // production:production
};
