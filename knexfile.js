// Update with your config settings.

var process = require('process');
var Knex = require('knex');
var config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE
};

if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
  config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

module.exports = {
  knex:require('knex')({
    client: 'postgresql',
    connection: config
  })
  // development:knex,
  // production:knex
};
