const bookshelf = require('./bookshelf')

var Atc = bookshelf.Model.extend({
  idAttribute: ['FK_answerKey', 'FK_competencyKey'],
  tableName: 'inbox_answerToCompetency',
})

module.exports = bookshelf.model('Atc', Atc)
