// Update with your config settings.

var process = require('process');
var Knex = require('knex');
var knex = connect();
function connect () {
  var config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }

  // Connect to the database
  var knex = Knex({
    client: 'pg',
    connection: config
  });

  return knex;
}
  var conn=knex;

module.exports = {
  knex:knex,
  development:knex,
  production:knex
};
