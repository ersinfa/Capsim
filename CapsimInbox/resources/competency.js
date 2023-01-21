const bookshelf = require('./bookshelf')

const Competency = bookshelf.Model.extend({

    tableName: 'inbox_competency',

    idAttribute: 'competencyKey',

    version: function() {
        return this.belongsTo('Version', 'versionKey', 'FK_versionKey')
    },

    answers: function() {
        return this.belongsToMany('Answer', 'inbox_answerToCompetency', 'FK_competencyKey', 'FK_answerKey')
    },

    answerToCompetency: function() {
        return this.hasMany('Atc', 'FK_competencyKey', 'competencyKey')
    }
})

module.exports = bookshelf.model('Competency', Competency)
