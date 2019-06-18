const bookshelf = require('./bookshelf')

var Answer = bookshelf.Model.extend({

    tableName: 'entry_answer',

    idAttribute: 'answerKey',

    question: function() {
        return this.belongsTo('EntryQuestion', 'FK_questionKey', 'questionKey')
    }

})
module.exports = bookshelf.model('EntryAnswer', Answer)
