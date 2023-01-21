const bookshelf = require('./bookshelf')

var Ntv = bookshelf.Model.extend({
  idAttribute: ['FK_editorNameKey', 'FK_versionKey'],
  tableName: 'inbox_editorNameToVersion',
})

module.exports = bookshelf.model('Ntv', Ntv)