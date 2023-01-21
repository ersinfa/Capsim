const bookshelf = require('./bookshelf')

const FileStatus = bookshelf.Model.extend({

    tableName: 'inbox_fileStatus',

    idAttribute: 'fileStatusKey'

})
module.exports = bookshelf.model('FileStatus', FileStatus)

