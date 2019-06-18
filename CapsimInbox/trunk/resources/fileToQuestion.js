const bookshelf = require('./bookshelf')
require('./file')
const FileToQuestion = bookshelf.Model.extend({
  
  tableName: 'inbox_fileToQuestion',

  idAttribute: ['FK_fileKey', 'FK_questionKey'],

  file() {
    return this.hasOne( 'File', 'fileKey','FK_fileKey' );
  },

})

module.exports = bookshelf.model('FileToQuestion', FileToQuestion)
