const bookshelf = require('./bookshelf')

const roleModel = bookshelf.Model.extend({

    tableName: 'inbox_role',

    idAttribute: 'roleKey',

})
module.exports = bookshelf.model('Role', roleModel)
