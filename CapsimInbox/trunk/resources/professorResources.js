const bookshelf = require('./bookshelf')
require('./file')
const ProfessorResources = bookshelf.Model.extend({
  
  tableName: 'inbox_professorResources',

  idAttribute: ['FK_fileKey', 'FK_versionKey'],

  file() {
    return this.hasOne( 'File', 'fileKey','FK_fileKey' );
  },

})

module.exports = bookshelf.model('ProfessorResources', ProfessorResources)
