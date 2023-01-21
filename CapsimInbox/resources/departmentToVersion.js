const bookshelf = require('./bookshelf')

var Dtv = bookshelf.Model.extend({
  idAttribute: ['FK_editorDeptKey', 'FK_versionKey'],
  tableName: 'inbox_editorDeptToVersion',
})

module.exports = bookshelf.model('Dtv', Dtv)
