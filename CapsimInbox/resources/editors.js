const bookshelf = require('./bookshelf')

require('./version')

var EditorName = bookshelf.Model.extend({
  tableName: 'inbox_editorName',
  idAttribute: 'EditorNameKey',

  // version: function() {
  //   return this.belongsToMany('Version', 'inbox_editorNameToVersion', 'FK_versionKey', 'FK_editorNameKey')
  // }

})

module.exports = bookshelf.model('EditorName', EditorName)
