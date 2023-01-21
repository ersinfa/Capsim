const bookshelf = require('./bookshelf')

var QuestionType = bookshelf.Model.extend({
    tableName: 'inbox_questionType',
    idAttribute: 'questionType'
})

module.exports = bookshelf.model('QuestionType', QuestionType)
