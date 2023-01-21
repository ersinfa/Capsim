const bookshelf = require('./bookshelf')

const DependsOn = bookshelf.Model.extend({
  idAttribute: ['FK_questionKey','FK_answerKey'],
  tableName: 'inbox_questionToDependsOn',
})

module.exports = bookshelf.model('DependsOn', DependsOn)
