const db = require('../services/db')('CapsimInbox')
const bookshelf = require('bookshelf')(db)
const cascadeDelete = require('bookshelf-cascade-delete')

bookshelf.plugin('registry')
bookshelf.plugin('virtuals')
bookshelf.plugin('visibility')
bookshelf.plugin(cascadeDelete)

module.exports = bookshelf
