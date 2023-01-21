const bookshelf = require('./bookshelf')

var DisplayType = bookshelf.Model.extend({
    tableName: 'inbox_questionDisplayType',
    idAttribute: 'questionDisplayType'
})

module.exports = bookshelf.model('DisplayType', DisplayType)
