const bookshelf = require('./bookshelf')


var QuestionGroupToSkill = bookshelf.Model.extend({
  idAttribute: ['FK_questionGroupKey', 'FK_skillKey'],
  tableName: 'inbox_questionGroupToSkill',
})

module.exports = bookshelf.model('QuestionGroupToSkill', QuestionGroupToSkill)
