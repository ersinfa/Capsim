
module.exports = (database) => {

    const dbCredentials = {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD
    }


    return {
        client: 'mssql',
        debug: true,
        connection: {
            database: `${dbCredentials.user.toUpperCase()}_${database}`,
            server: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password
        },
        pool: {
            min: 0,
            //max: 10,
            max: 1000,
            //idleTimeoutMillis: 50000,
            //softIdleTimeoutMillis: 20000,
            //evictionRunIntervalMillis: 5000,
            //reapIntervalMillis: 10000,
            //createRetryIntervalMillis: 5000
            idleTimeoutMillis: 5000,
            acquireTimeoutMillis: 30000,
            createTimeoutMillis: 30000,
            softIdleTimeoutMillis: 2000,
            evictionRunIntervalMillis: 500,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 500
        },
        acquireConnectionTimeout: 10000
    };
};
/** **********************************************************************************************************
 * config.js - returns the database connection properties
 * See https://github.com/Vincit/tarn.js for possible pool config options.
 *@author andrew.kralovec
*/
