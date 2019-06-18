const bookshelf = require('./bookshelf')

// require('./version')
const Skill = bookshelf.Model.extend({

    tableName: 'inbox_skill',

    idAttribute: 'skillKey',

    version: function() {
        return this.belongsTo('Version', 'versionKey', 'FK_versionKey')
    },

    answers: function() {
        return this.belongsToMany('Answer', 'inbox_answerToSkill', 'FK_skillKey', 'FK_answerKey')
    },

    answerToSkill: function() {
        return this.hasMany('Ats', 'FK_skillKey', 'skillKey')
    }
})

module.exports = bookshelf.model('Skill', Skill)
