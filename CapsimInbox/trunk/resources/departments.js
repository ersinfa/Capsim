const bookshelf = require('./bookshelf')

var EditorDept = bookshelf.Model.extend({
  tableName: process.env.capsimInboxDb + 'inbox_editorDept',
  idAttribute: 'EditorDeptKey'
})

module.exports = bookshelf.model('EditorDept', EditorDept)
