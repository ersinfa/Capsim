const bookshelf = require('./bookshelf')

const Vts = bookshelf.Model.extend({
  idAttribute: ['versionKey', 'simKey'],
  tableName: 'inbox_versionToSim',
})

module.exports = bookshelf.model('Vts', Vts)
