const bookshelf = require('./bookshelf')
require('./userFile') 

const studentToSimModel = bookshelf.Model.extend({
    tableName: 'inbox_studentToSim',
    idAttribute: 'studentToSimKey',

    files: function(){
        return this.belongsToMany('UserFile', 'inbox_userFileToUser', 'FK_studentToSimKey', 'FK_userFileKey')
    },
})
module.exports = bookshelf.model('StudentToSim', studentToSimModel)