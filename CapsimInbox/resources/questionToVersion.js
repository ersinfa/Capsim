const bookshelf = require('./bookshelf')

var Qtv = bookshelf.Model.extend({
  idAttribute: ['FK_questionKey', 'FK_versionKey'],
  tableName: 'inbox_questionToVersion',
})

module.exports = bookshelf.model('Qtv', Qtv)
