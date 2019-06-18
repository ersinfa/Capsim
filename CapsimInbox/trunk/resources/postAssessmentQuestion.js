const bookshelf = require('./bookshelf')
require('./construct')

const postAssessmentQuestion = bookshelf.Model.extend({

    tableName: 'postAssessment_question',

    idAttribute: 'questionKey',

    version: function() {
        return this.belongsTo('Version', 'versionKey', 'FK_versionKey')
    },

    construct() {
        return this.hasOne( 'Construct', 'constructKey','FK_constructKey' );
    },

})
module.exports = bookshelf.model('PostAssessmentQuestion', postAssessmentQuestion)