const bookshelf = require('./bookshelf')

const FileType = bookshelf.Model.extend({

    tableName: 'inbox_fileType',

    idAttribute: 'fileTypeKey'

})
module.exports = bookshelf.model('FileType', FileType)
