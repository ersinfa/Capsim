const bookshelf = require('./bookshelf')

const UserType = bookshelf.Model.extend({

    tableName: 'inbox_userType',

    idAttribute: 'userTypeKey'

})
module.exports = bookshelf.model('UserType', UserType)
