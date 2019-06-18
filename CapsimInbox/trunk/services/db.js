module.exports = (() => {
  // connection strings
  const capsimInboxConnection = require('./config')('CapsimInbox')
  const capstoneConnection = require('./config')('Capstone')
  const capsimConnection = require('./config')('Capsim')
  // open connection instances
  const capsimInboxDB = require('knex')(capsimInboxConnection)
  const capstoneDB = require('knex')(capstoneConnection)
  const capsimDB = require('knex')(capsimConnection)
  // integrate the current db function
  return (database) => {
    switch (database) {
      case 'CapsimInbox':
        return capsimInboxDB
      case 'Capstone':
        return capstoneDB;
      case 'Capsim':
        return capsimDB;
      default:
        return capsimInboxDB;
    }
  }
})();
/** **********************************************************************************************************
 * db.js - returns the database client
 * @author andrew.kralovec
 */
