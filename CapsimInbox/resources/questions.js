const bookshelf = require('./bookshelf')

require('./answer')
require('./author')
require('./displayType')
require('./questionType')
require('./version')
require('./fileToQuestion')
var Question = bookshelf.Model.extend({

    tableName: 'inbox_question',

    idAttribute: 'questionKey',

    answers: function() {
        return this.hasMany('Answer', 'FK_questionKey', 'questionKey')
    },

    author: function() {
        return this.hasOne('Author', 'authorKey', 'FK_authorKey')
    },

    questionDisplayType: function() {
        return this.hasOne('DisplayType', 'questionDisplayTypeKey', 'FK_questionDisplayTypeKey')
    },
    
    questionType: function() {
        return this.hasOne('QuestionType', 'questionTypeKey', 'FK_questionTypeKey')
    },

    questionToVersion: function() {
        return this.hasOne('Qtv', 'FK_questionKey', 'questionKey')
    },

    fileToQuestion: function() {
        return this.hasMany('FileToQuestion','FK_questionKey','questionKey')
    }
}, {
    dependents: ['answers', 'questionToVersion']
})

module.exports = bookshelf.model('Question', Question)
