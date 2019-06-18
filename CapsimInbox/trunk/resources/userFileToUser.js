const bookshelf = require('./bookshelf')
require('./userFile')
const UserFileToUser = bookshelf.Model.extend({
  
  tableName: 'inbox_userFileToUser',

  idAttribute: ['FK_userFileKey', 'FK_studentToSimKey'],

})

module.exports = bookshelf.model('UserFileToUser', UserFileToUser)
