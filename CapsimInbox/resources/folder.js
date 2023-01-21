const bookshelf = require('./bookshelf')

require('./fileToFileFolder')
// require('./file')

const Folder = bookshelf.Model.extend({

    tableName: 'inbox_fileFolder',

    idAttribute: 'fileFolderKey',

    // files: function() {
    //     return this.hasMany('File', 'FK_fileFolderKey', 'fileFolderKey')
    // },

    fileToFileFolder: function() {
      return this.hasMany('FileToFileFolder','FK_fileFolderKey','fileFolderKey')
    }

})
module.exports = bookshelf.model('Folder', Folder)



// const bookshelf = require('./bookshelf')

// require('./fileToFileFolder')
// require('./file')
// const Folder = bookshelf.Model.extend({

//     tableName: 'inbox_fileFolder',

//     idAttribute: 'fileFolderKey',

//     files: function() {
//         return this.hasMany('File').through('inbox_fileToFileFolder', 'fileFolderKey','FK_fileFolderKey')
//     }

// })
// module.exports = bookshelf.model('Folder', Folder)
