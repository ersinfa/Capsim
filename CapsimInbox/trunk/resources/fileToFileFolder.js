const bookshelf = require('./bookshelf')
require('./file')
const FileToFileFolder = bookshelf.Model.extend({
  
  tableName: 'inbox_fileToFileFolder',

  idAttribute: ['FK_fileKey', 'FK_fileFolderKey'],

  file() {
    return this.hasOne( 'File', 'fileKey','FK_fileKey' );
  },

})

module.exports = bookshelf.model('FileToFileFolder', FileToFileFolder)
