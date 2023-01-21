const bookshelf = require('./bookshelf')

require('./version')
var Author = bookshelf.Model.extend({
    tableName: 'inbox_author',
    idAttribute: 'authorKey',
    version: function() {
        return this.belongsTo('Version', 'versionKey', 'FK_versionKey')
    },

    questions: function() {
        return this.hasMany('Question', 'FK_authorKey', 'authorKey')
    }
})

module.exports = bookshelf.model('Author', Author)
