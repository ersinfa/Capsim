const db = require('./db.js')
const ss = require('./studentSetting')
const rd = require('./reportData.js')
const Request = require('../lib/request')
const Helper = require('./helper')
const game = require('./gameData')
const sectionSettings = require('./sectionSettings')
const studentSettings = require('./studentSetting')

EditExam = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( EditExam.prototype, {

  async getVersionQuestionGroups( versionKey ){
    let questionGroup = await db('CapsimInbox')
    .select()
    .from('inbox_questionGroup')
    .where('FK_versionKey' , versionKey)
    .orderBy('name','ASC')

    let questionGroupKeyArray = questionGroup.map(e=> e.questionGroupKey)

    let questionGroupSkills = await db('CapsimInbox')
    .select()
    .from('inbox_questionGroupToSkill AS qgts')
    .innerJoin('inbox_skill AS s','s.skillKey','qgts.FK_skillKey')
    .whereIn('qgts.FK_questionGroupKey' , questionGroupKeyArray)
    
    let questionGroupCompetencies = await db('CapsimInbox')
    .select()
    .from('inbox_questionGroupToCompetency AS qgtc')
    .innerJoin('inbox_competency AS c','c.competencyKey','qgtc.FK_competencyKey')
    .whereIn('qgtc.FK_questionGroupKey' , questionGroupKeyArray)

    questionGroup.forEach(e=>{
      e.skills = questionGroupSkills.filter(skill=> skill.FK_questionGroupKey == e.questionGroupKey )
      e.competencies = questionGroupCompetencies.filter(competency=> competency.FK_questionGroupKey == e.questionGroupKey )
    })
    return questionGroup
  },
 
  getQuestionGroupToSim( simKey ){
    return db('CapsimInbox')
    .select('FK_questionGroupKey')
    .from('inbox_questionGroupToSim')
    .where('FK_simKey' , simKey)
    .map(row => row.FK_questionGroupKey)
  },

  async getExamQuestions( versionKey, simKey ){
    let versionQuestionGroups = await this.getVersionQuestionGroups(versionKey)
    let questionGroupToSim = await this.getQuestionGroupToSim(simKey)
    let assignQuestions = versionQuestionGroups.filter(e=> questionGroupToSim.includes(e.questionGroupKey))
    let unAssignQuestions = versionQuestionGroups.filter(e=> !questionGroupToSim.includes(e.questionGroupKey))
    return {assignQuestions,unAssignQuestions}
  },



  async updateQuestionGroupsToSim( simKey, questionGroupArr ){
    const isExamLocked = await this.hasStudentsStartedExam( simKey )
    if(isExamLocked == false){
      await this.deleteQuestionGroupsToSim( simKey )
      await this.insertQuestionGroupsToSim( simKey, questionGroupArr )
    }
    return true
  },
 

  deleteQuestionGroupsToSim( simKey ){
    return db('CapsimInbox')
    .table('inbox_questionGroupToSim')
    .where('FK_simKey', simKey)
    .del()
  },

  insertQuestionGroupsToSim( simKey, questionGroupArr ){
    const insertVal = []
    questionGroupArr.forEach(questionGroupKey=>{
      insertVal.push(
        {
          FK_simKey:simKey,
          FK_questionGroupKey:questionGroupKey
        }
      )
    })
    return db('CapsimInbox').batchInsert('inbox_questionGroupToSim',insertVal)
  },

  async generateStudentsPassword( simKey ){
    const simStudentKeyArr = await this.getSimStudentKeyArr( simKey ) 
    simStudentKeyArr.forEach( studentToSimKey => studentSettings.setSettings( studentToSimKey, 'password', Math.random().toString(36).substr(2, 8), 'assessment' ) )
    return true
  },

  getSimStudentKeyArr( simKey ){
    return db('CapsimInbox')
    .select()
    .from('inbox_studentToSim')
    .where('FK_simKey' , simKey)
    .map(row => row.studentToSimKey)
  },

  async hasStudentsStartedExam( simKey ){
     const studnetsWhoStartedExam = await db('CapsimInbox')
    .select()
    .from('inbox_studentToSim AS sts')
    .innerJoin('inbox_studentLog AS sl','sl.FK_studentToSimKey','sts.studentToSimKey')
    .where({'sts.FK_simKey': simKey,'sl.FK_logActionTypeKey':1})
    console.log(studnetsWhoStartedExam.length)
    return studnetsWhoStartedExam.length > 0
  },

   
})
