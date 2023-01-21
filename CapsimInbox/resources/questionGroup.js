const bookshelf = require('./bookshelf')

require('./questions')
require('./questionGroupToSkill')
require('./questionGroupToCompetency')

const QuestionGroup = bookshelf.Model.extend({

    tableName: 'inbox_questionGroup',

    idAttribute: 'questionGroupKey',

    questionGroupToSkill: function() {
        return this.hasMany('QuestionGroupToSkill', 'FK_questionGroupKey', 'questionGroupKey')
    },

    questionGroupToCompetency: function() {
        return this.hasMany('QuestionGroupToCompetency', 'FK_questionGroupKey', 'questionGroupKey')
    },
  
    questions: function() {
      return this.hasMany('questions','FK_questionGroupKey','questionGroupKey')
    }

})
module.exports = bookshelf.model('QuestionGroup', QuestionGroup)

