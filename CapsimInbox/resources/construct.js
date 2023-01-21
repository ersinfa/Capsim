const bookshelf = require('./bookshelf')

const construct = bookshelf.Model.extend({

    tableName: 'postAssessment_construct',

    idAttribute: 'constructKey',

    version: function() {
        return this.belongsTo('Version', 'versionKey', 'FK_versionKey')
    }

})
module.exports = bookshelf.model('Construct', construct)
