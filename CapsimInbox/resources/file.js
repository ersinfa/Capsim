const bookshelf = require('./bookshelf')
const fileManager = require('../services/fileManager')

require('./fileType')
const fileModel = bookshelf.Model.extend({

    tableName: 'inbox_file',

    idAttribute: 'fileKey',

    fileType: function() {
        return this.hasOne('FileType', 'fileTypeKey', 'FK_fileTypeKey')
    },

    destroy() {
        return fileManager.deleteFile(`${this.get('fileName')}`)
                .then( () => bookshelf.Model.prototype.destroy.call(this) )
    }

})
module.exports = bookshelf.model('File', fileModel)
