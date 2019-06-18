const bookshelf = require('./bookshelf')

var Question = bookshelf.Model.extend({

    tableName: 'entry_question',

    idAttribute: 'questionKey',

    entryAnswers: function() {
        return this.hasMany('EntryAnswer', 'FK_questionKey', 'questionKey')
    }
}, {
    dependents: ['entryAnswers']
})

module.exports = bookshelf.model('EntryQuestion', Question)
