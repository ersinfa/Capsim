var db = require('./db.js');
EntryQuestionnaire = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( EntryQuestionnaire.prototype, {


    buildQuestionnaire() {
      return this.getQuestionnaireData()
      .then( ([questions, answers]) => {

        for(var i = 0; i < questions.length; i++ ){
            questions[i].answers = answers.filter(function(answer){ return answer.FK_questionKey == questions[i].questionKey })
        }

        return questions
      })
    },

    getQuestionnaireData() {
      return Promise.all([this.getQuestions(), this.getAnswers()])
    },

    getAssessmentAnswers(FK_versionKey){
        return db('CapsimInbox').select()
        .from('entry_question')
        .whereIn("FK_versionKey", FK_versionKey)
    },

    getQuestions(){
        return db('CapsimInbox').select(
                'questionKey',
                'nameTagKey'
            )
            .from('entry_question')
            .where('isActive',1)
            .orderBy('sort','ASC')
    },

    getAnswers(){
        return db('CapsimInbox').select(
                'answerKey',
                'FK_questionKey',
                'nameTagKey'
            )
            .from('entry_answer')
            .orderBy('sort','ASC')
    },


    setAnswer(answers) {
         return db('CapsimInbox').batchInsert('entry_studentToAnswer', answers)
    },

})
