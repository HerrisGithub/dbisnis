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
  }

  var knex=require('knex')(development);

module.exports = {
  knex:require('knex')({
    client: 'pg',
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
  }),
  // development:development,
  // production:production
};
