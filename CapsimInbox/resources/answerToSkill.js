const bookshelf = require('./bookshelf')

var Ats = bookshelf.Model.extend({
  idAttribute: ['FK_answerKey', 'FK_skillKey'],
  tableName: 'inbox_answerToSkill',
})

module.exports = bookshelf.model('Ats', Ats)
