const bookshelf = require('./bookshelf')
const fileManager = require('../services/fileManager')

require('./fileType')
require('./fileStatus') 
require('./userType') 
require('./userFileToUser') 
const userFileModel = bookshelf.Model.extend({

    tableName: 'inbox_userFile',

    idAttribute: 'userFileKey',

    fileType: function() {
        return this.hasOne('FileType', 'fileTypeKey', 'FK_fileTypeKey')
    },

    fileStatus: function() {
        return this.hasOne('FileStatus', 'fileStatusKey', 'FK_fileStatusKey')
    },

    userType: function() {
        return this.hasOne('UserType', 'userTypeKey', 'FK_userTypeKey')
    },

    destroy() {
        return fileManager.deleteFile(`${this.get('fileName')}`)
                .then( () => bookshelf.Model.prototype.destroy.call(this) )
    }

})
module.exports = bookshelf.model('UserFile', userFileModel)
