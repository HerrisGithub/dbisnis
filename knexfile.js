// Update with your config settings.

var config = {
    host:'104.154.29.255',
    user : 'postgres',
    password : 'postgres',
    database : 'direktoribisnis',
    port:1234
};
// if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
//   config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
// }
// 'postgres://postgres:postgres@127.0.0.1:8989/direktoribisnis')
// var config ='postgres://postgres@direktoribisnis:suhendra94$@direktoribisnis.postgres.database.azure.com:5432/direktoribisnis?ssl=true';
module.exports = {

  development: {
    client : 'postgresql',
    connection: config,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    ssl:false
  },

  staging: {
    client: 'postgresql',
    connection:config,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: config,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  knex:require('knex')({
    client: 'postgresql',
    connection: config,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  })

};
