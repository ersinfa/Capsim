const bookshelf = require('./bookshelf')

// require('./version')
const LearningGoal = bookshelf.Model.extend({

    tableName: 'inbox_learningGoal',

    idAttribute: 'learningGoalKey',

    version: function() {
        return this.belongsTo('Version', 'versionKey', 'FK_versionKey')
    },

    answers: function() {
        return this.belongsToMany('Answer', 'inbox_answerToLearningGoal', 'FK_learningGoalKey', 'FK_answerKey')
    },

    answerToLearningGoal: function() {
        return this.hasMany('Atl', 'FK_learningGoalKey', 'learningGoalKey')
    }
})

module.exports = bookshelf.model('LearningGoal', LearningGoal)
