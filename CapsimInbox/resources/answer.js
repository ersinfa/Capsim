const bookshelf = require('./bookshelf')

require('./answerToSkill')
require('./answerToLearningGoal')
var Answer = bookshelf.Model.extend({

    tableName: 'inbox_answer',

    idAttribute: 'answerKey',

    skills: function() {
        return this.belongsToMany('Skill', 'inbox_answerToSkill', 'FK_skillKey', 'FK_answerKey')
    },
    competencies: function() {
        return this.belongsToMany('Competency', 'inbox_answerToCompetency', 'FK_competencyKey', 'FK_answerKey')
    },
    learningGoals: function() {
        return this.belongsToMany('LearningGoal', 'inbox_answerToLearningGoal', 'FK_learningGoalKey', 'FK_answerKey')
    },
    answerToSkill: function() {
        return this.hasMany('Ats', 'FK_answerKey', 'answerKey')
    },
    answerToCompetency: function() {
        return this.hasMany('Atc', 'FK_answerKey', 'answerKey')
    },
    answerToLearningGoal: function() {
        return this.hasMany('Atl', 'FK_answerKey', 'answerKey')
    },
    question: function() {
        return this.belongsTo('Question', 'FK_questionKey', 'questionKey')
    }

})
module.exports = bookshelf.model('Answer', Answer)
