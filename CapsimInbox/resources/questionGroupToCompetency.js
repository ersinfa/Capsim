const bookshelf = require('./bookshelf')

var QuestionGroupToCompetency = bookshelf.Model.extend({
  idAttribute: ['FK_questionGroupKey', 'FK_competencyKey'],
  tableName: 'inbox_questionGroupToCompetency',
})

module.exports = bookshelf.model('QuestionGroupToCompetency', QuestionGroupToCompetency)
