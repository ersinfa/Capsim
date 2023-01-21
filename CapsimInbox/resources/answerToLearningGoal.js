const bookshelf = require('./bookshelf')

var Atl = bookshelf.Model.extend({
  idAttribute: ['FK_answerKey', 'FK_learningGoalKey'],
  tableName: 'inbox_answerToLearningGoal',
})

module.exports = bookshelf.model('Atl', Atl)
