const db = require('./db.js')
const ss = require('./studentSetting')
const rd = require('./reportData.js')
const Request = require('../lib/request')
const Helper = require('./helper')
const game = require('./gameData')
const gameScore = require('./gameScore')
const sectionSettings = require('./sectionSettings')
const studentReport = require('./studentReport')
const constants = require('./constants')
const moment = require('moment')

function isJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

StudentAdmin = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( StudentAdmin.prototype, {


  async updateStudentTimer( simKey, stsKey, versionKey ) {
    let scoringAutomationSettings  = await sectionSettings.getSettingsByConfigName(simKey,'scoringAutomation')

    let studentSetting  = await ss.getSettingsByConfigName(stsKey,'assessment')
    if(typeof scoringAutomationSettings.timePerSubjectArea != 'undefined' && !isNaN(parseInt(scoringAutomationSettings.timePerSubjectArea))){
      let clearedCompetencies = studentSetting.clearedCompetencies || []
      let numberOfCompetencies = 1
      if(clearedCompetencies.length > 0){
        numberOfCompetencies = clearedCompetencies.length
      }else{
        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        const simMeasurementKeys       = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simCompetencyKeyArr      = [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))].filter(e=> e !== null)
        numberOfCompetencies = simCompetencyKeyArr.length
      }
      let additionalTime = numberOfCompetencies * parseInt(scoringAutomationSettings.timePerSubjectArea)
      await ss.setSettings( stsKey, 'timer', additionalTime, 'assessment' )
    }

  },

  async getStudentExamCompetencies( simKey, stsKey, versionKey ) {
    let studentAssesmentSettings  = await ss.getSettingsByConfigName(stsKey,'assessment')
    if(typeof studentAssesmentSettings.clearedCompetencies != 'undefined'
    && Array.isArray(studentAssesmentSettings.clearedCompetencies)
    && studentAssesmentSettings.clearedCompetencies.length > 0){
     return studentAssesmentSettings.clearedCompetencies
    }else{
     let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
     : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)
     const simMeasurementKeys = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
     return [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))].filter(e=> e !== null)
    }
  },

  async getStudentExamtimer( simKey, stsKey, versionKey ) {
    let studentSettings  = await ss.getSettings(stsKey)
    if (typeof studentSettings !== 'undefined'){
      let studentSettingsData = JSON.parse(studentSettings.settingJSON)
      if(typeof studentSettingsData.webapp !== 'undefined'){
        if(typeof studentSettingsData.webapp.data.additionalTime !== 'undefined' && studentSettingsData.webapp.data.additionalTime != '' ){
            return studentSettingsData.webapp.data.additionalTime
        }
      }
      if(typeof studentSettingsData.assessment !== 'undefined'){
        if(typeof studentSettingsData.assessment.timer !== 'undefined' && studentSettingsData.assessment.timer != ''){
         return studentSettingsData.assessment.timer
        }
      }
    }

    let sectionSetting = await db('CapsimInbox').first('ss.settingJSON').from('inbox_sectionSetting AS ss').innerJoin(process.env.capstoneDb + 'sim AS s', 's.sectionKey', 'ss.fk_sectionKey').where( {'s.simkey':simKey})
    if (typeof sectionSetting !== 'undefined'){
      let sectionSettingData = JSON.parse(sectionSetting.settingJSON)
      if(typeof sectionSettingData.exam !== 'undefined'){
          if(typeof sectionSettingData.exam.data.time !== 'undefined' && sectionSettingData.exam.data.time != ''){
              return sectionSettingData.exam.data.time
          }
      }
    }

    let {versionTimer} = await db('CapsimInbox').first('v.isExam', 'v.timer as versionTimer').from('inbox_version AS v').where( {'v.versionKey':versionKey})
   return versionTimer

  },


  // Sets log of timer and log of competencies taken 
  async setAdditionalLog( simKey, stsKey, versionKey ) {
    let studentExamCompetencies = await this.getStudentExamCompetencies(simKey,stsKey,versionKey)
    studentExamCompetencies = JSON.stringify(studentExamCompetencies)
    await game.setLog({ FK_studentToSimKey: stsKey, FK_logActionTypeKey:11, key: 2, value: studentExamCompetencies })

    let studentExamtimer = await this.getStudentExamtimer( simKey, stsKey, versionKey )
    await game.setLog({ FK_studentToSimKey: stsKey, FK_logActionTypeKey:12, value: studentExamtimer })
  },

  async automatedClearStudentScore( simKey, stsKey ) {
    let scoringAutomationSettings  = await sectionSettings.getSettingsByConfigName(simKey,'scoringAutomation')
    let competencyArrayToClearArr = scoringAutomationSettings.competenciesToClear || []
    let scoreBenchmark = scoringAutomationSettings.scoreBenchmark || -1
    let autoClearScore = false
    if(competencyArrayToClearArr.length > 0 && scoreBenchmark >= 0 && scoreBenchmark <= 100 ){
      
      let studentAssesmentSettings  = await ss.getSettingsByConfigName(stsKey,'assessment')
      if (typeof studentAssesmentSettings.clearedCompetencies !== 'undefined' && studentAssesmentSettings.clearedCompetencies.length > 0 ){
          competencyArrayToClearArr = competencyArrayToClearArr.filter(e=> studentAssesmentSettings.clearedCompetencies.includes(parseInt(e)))
      }
      let competencyScore = await studentReport.getCompetencyScore(stsKey)
      let competenciesToClear = []
      Object.keys(competencyScore).forEach(competency=> {
        if (competencyScore[competency] < scoreBenchmark && competencyArrayToClearArr.includes(parseInt(competency))) competenciesToClear.push(parseInt(competency))
      })
      if(competenciesToClear.length > 0 ) {
        this.clearStudentScore(stsKey, competenciesToClear)
        autoClearScore = true
      }
    }
    if(autoClearScore == false) ss.setSettings( stsKey, 'clearedCompetencies', [], 'assessment' )

  },

    async clearStudentScore( stsKey, competencyArray ) {   
      
      
      let studentScore = await this.getStudentScore( stsKey )
      if(typeof studentScore != 'undefined'){
        let questionKeyArray = await this.getQuestionArrayFromCompetencies(competencyArray)

        let increment = 1
        await this.updateStudentToAnswerHistory(stsKey,increment)
        await this.updateStudentScoreHistory(stsKey,increment)
        await this.updateStudentLogAnswersHistory(stsKey,increment)
        await this.populateStudentAnswers(stsKey,questionKeyArray)
        
        await ss.setSettings( stsKey, 'completed', false, 'assessment' )
        await ss.setSettings( stsKey, 'clearedScore', true, 'assessment' ) 
        await ss.setSettings( stsKey, 'clearedCompetencies', competencyArray, 'assessment' )
        
        return true
      }
      
      return false
    },

    async undoClearStudentScore( stsKey ) {

      let studentScore = await this.getStudentScore( stsKey )
      if(typeof studentScore == 'undefined'){
        let hasEnteredExam = await db('CapsimInbox').first().from('inbox_studentLog').where({'FK_studentToSimKey': stsKey,'FK_logActionTypeKey':1,'historyKey':0})
        if(typeof hasEnteredExam == 'undefined'){
          let increment = -1
          await this.deleteStudentToAnswer(stsKey)
          // await this.deleteStudentLog(stsKey)
          
          await this.updateStudentToAnswerHistory(stsKey,increment)
          await this.updateStudentScoreHistory(stsKey,increment)
          await this.updateStudentLogAnswersHistory(stsKey,increment)
          
          await ss.setSettings( stsKey, 'completed', true, 'assessment' )
          await ss.setSettings( stsKey, 'clearedScore', false, 'assessment' ) 
          await ss.setSettings( stsKey, 'clearedCompetencies', [], 'assessment' )
          return {status:200,message:"Scores have been restored."}
        }
        return {status:400,message:"Failed to restore scores. Student has started exam."}
      }
      return {status:400,message:"Failed to restore scores. Student has completed exam."}

    },
  
    populateStudentAnswers(stsKey,questionKeyArray){
      return db('CapsimInbox').from(db('CapsimInbox').raw('?? (??, ??, ??, ??)', ['inbox_studentToAnswer', 'FK_answerKey', 'FK_questionKey', 'FK_studentToSimKey', 'historyKey']))
       .insert(function() {
        this.from('inbox_studentToAnswer AS sta')
          .whereNotIn('sta.FK_questionKey', questionKeyArray)
          .andWhere({'sta.FK_studentToSimKey':stsKey,'historyKey':1})
          .select('sta.FK_answerKey', 'sta.FK_questionKey', 'sta.FK_studentToSimKey', 0)
       });
    },

  setProfessorLog({ FK_professorKey, FK_logActionTypeKey, key = null, value = null }){
      return db('CapsimInbox').insert({
          FK_professorKey,
          FK_logActionTypeKey,
          key:key,
          value:value
      })
      .into('inbox_professorLog')
  },

  async getProfessorLog(FK_professorKey, sectionkey){
    let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
    .from(process.env.capstoneDb + 'section as section')
    .where({"sectionkey":sectionkey})
    timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'
    const rawQuery = process.env.capstoneDb + 'Msiconvertesttolocal_(dateTime, '+timeZoneInfo.worldtimekey+', '+timeZoneInfo.dstpref+', '+timeZoneInfo.timeampm+') AS [localDate]'

    let retval = await db('CapsimInbox').select(
			'FK_logActionTypeKey',
			'key',
			'value',
			'dateTime'
    )
    .select(db('Capstone').raw(rawQuery))
		.from('inbox_professorLog')
		.where( 'FK_professorKey', FK_professorKey)
    .orderBy('dateTime', 'desc')
    retval.forEach(row =>{
      row.dateTime =  moment.utc(row.localDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
    })
    return retval
  },

    getQuestionArrayFromCompetencies( competencyArray ){
      return db('CapsimInbox').select('a.FK_questionKey')
      .from('inbox_competency AS c')
      .innerJoin('inbox_answerToCompetency AS atc', 'atc.FK_competencyKey', 'c.competencyKey')
      .innerJoin('inbox_answer AS a', 'a.answerKey', 'atc.FK_answerKey')
      .whereIn( 'c.competencyKey',competencyArray)
      .map( row => row.FK_questionKey )
    },

    deleteStudentToAnswer( stsKey ){
      return db('CapsimInbox')
      .table('inbox_studentToAnswer')
      .where({'FK_studentToSimKey':stsKey,'historyKey':0})
      .del()
    },

    deleteStudentLog( stsKey ){
      return db('CapsimInbox')
      .table('inbox_studentLog')
      .where({
        'FK_studentToSimKey':stsKey,
        'historyKey':0 
      })
      .del()
    },

    updateStudentToAnswerHistory( stsKey, increment ){
      return db('CapsimInbox')
      .table('inbox_studentToAnswer')
      .where('FK_studentToSimKey',stsKey)
      .increment('historyKey',increment)
    },

    updateStudentScoreHistory( stsKey, increment ){
      return db('CapsimInbox')
      .table('inbox_score')
      .where({'FK_studentToSimKey':stsKey})
      .increment('historyKey',increment)
    },

    updateStudentLogAnswersHistory( stsKey, increment ){
      return db('CapsimInbox')
      .table('inbox_studentLog')
      .where({
        'FK_studentToSimKey':stsKey,
      })
      .increment('historyKey',increment)
    },

    async getStudentReport(stsKey, versionKey, sectionkey){
      let versionQuestionGroupArr = await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

     
      let sectionInfo = await db('capstone').first('worldtimekey','timeampm','dstpref')
      .from(process.env.capstoneDb + 'section')
      .where({"sectionkey":sectionkey})
      let timeampm = (sectionInfo.timeampm)? '1':'0'
      const rawQuery = process.env.capstoneDb + 'Msiconvertesttolocal_([sl].dateTime, '+sectionInfo.worldtimekey+', '+sectionInfo.dstpref+', '+timeampm+') AS [localDate]'
      
      let studentAnswerLog = await db('CapsimInbox')
        .select('sl.dateTime', 'sl.key')
        .select(db('Capstone').raw(rawQuery))
        .from('inbox_studentLog AS sl')
        .where({"sl.FK_studentToSimKey":stsKey, "sl.FK_logActionTypeKey":3})
        .orderBy('sl.dateTime', 'desc')
        .then(result => {
          for(let i = 0; i < result.length; i++){
              let { localDate} = result[i]
              result[i].localDate =  moment.utc(localDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
          }
          return result
      })

      const studentToSimInfo          = await this.getStudentToSimInfo( stsKey )
      const studentAnswerKeyArr       = await this.getStudentAnswers(stsKey).map( row => row.FK_answerKey )
      const answers                   = await this.getReportAnswers( versionKey )
      const questions                 = await this.getReportQuestions( versionKey )
      const report                    = await this.requestReport(studentToSimInfo.FK_studentKey, studentToSimInfo.FK_simKey);
      const possibleSkillPoints       = await rd.getPosibleMeasurementPoints(versionQuestionGroupArr, constants.MEASUREMENT_TYPE_KEY.SKILL)
      const sectionSettingJSON        = await sectionSettings.getSettings(sectionkey)
      const studentScore              = await this.getStudentScore( stsKey )

      let skillScore = {}
      let isCompleted = false
      if (typeof studentScore !== 'undefined'){
        skillScore = JSON.parse(studentScore.skills) 
        isCompleted = true
      }

      // Adds student selected answers
      answers.forEach(answer => answer.picked = studentAnswerKeyArr.includes(answer.answerKey))
      for(let i = 0; i < questions.length; i++ ){
        questions[i].answers = answers.filter( answer => answer.FK_questionKey == questions[i].questionKey)
      }
      
      // Getting questions correct sort order
      const examData        = await game.buildSimulationData(stsKey, sectionkey, versionKey, 1)
      const sortedQuestionKeyArray = examData.emails.map(question => question.questionKey)
      let sortedQuestions = []
      sortedQuestionKeyArray.forEach(questionKey => {sortedQuestions.push(questions.filter(function(element){ return element.questionKey == questionKey; })[0]) })

      // Getting answers correct sort order
      if (sectionSettingJSON !== undefined){
          let sectionSetting = JSON.parse(sectionSettingJSON.settingJSON)
          if(sectionSetting.exam !== undefined && sectionSetting.exam.data !== undefined && sectionSetting.exam.data.isRandomizeAnswers == true)
              sortedQuestions = Helper.shuffleAnswers(sortedQuestions, stsKey)
      }

      sortedQuestions.forEach(e=>{ 
        let questionAnswerLog = studentAnswerLog.filter(log=> log.key == e.questionKey)[0]
        e.questionAnswerLogTime = (typeof questionAnswerLog != 'undefined')? questionAnswerLog.localDate :  ""
      })

      let competencyScore = await studentReport.getCompetencyScore(stsKey)
      return { skillScore, questions: sortedQuestions, report, possibleSkillPoints, isCompleted, competencyScore }
    },

    getReportQuestions( versionKey ){
      return db('CapsimInbox').select(
        'q.questionKey',
        'q.FK_questionTypeKey',
        's.skillKey',
        's.name as skillName',
        'q.descriptionTagKey as questionName',
        'q.sequence',
        'c.competencyKey as competencyKey',
        'c.name as competencyName',
        'q.subjectTagKey as questionTitle'
      )
        .from('inbox_question AS q')
        .innerJoin('inbox_questionGroup AS qg','qg.questionGroupKey','q.FK_questionGroupKey') 
        .innerJoin('inbox_answer AS a','a.FK_questionKey','q.questionKey') 
        .innerJoin('inbox_answerToSkill AS ats','a.answerKey','ats.FK_answerKey') 
        .innerJoin('inbox_skill AS s','s.skillKey','ats.FK_skillKey') 
        .innerJoin('inbox_answerToCompetency AS atc','a.answerKey','atc.FK_answerKey')
        .innerJoin('inbox_competency AS c','atc.FK_competencyKey','c.competencyKey') 
        .where({ 'qg.FK_versionKey': versionKey })
    },
    getReportAnswers( versionKey ){
      return db('CapsimInbox').select(
        'a.answerKey',
        'a.timeImpact',
        'a.FK_questionKey',
        'a.nameTagKey',
        'a.sequence',
        'a.isNotRandomized',
        'at.answerTypeKey',
        'ats.points',
        'at.name AS answerType'
      )
      .from('inbox_answer AS a')
      .innerJoin('inbox_answerType AS at', 'at.answerTypeKey', 'a.FK_answerTypeKey')
      .innerJoin('inbox_questionToVersion AS qtv', 'qtv.FK_questionKey', 'a.FK_questionKey')
      .leftJoin('inbox_answerToSkill AS ats', 'ats.FK_answerKey', 'a.answerKey')
      .where( 'qtv.FK_versionKey', versionKey )
      .orderBy('a.sequence','ASC')
    },
    getStudentAnswers( stsKey ){
      return db('CapsimInbox').select().from('inbox_studentToAnswer').where( {'FK_studentToSimKey': stsKey, 'historyKey':0 } )
    },
    getStudentToSimInfo( stsKey ){
      return db('CapsimInbox').first().from('inbox_studentToSim').where('studentToSimKey' , stsKey)
    },
    getStudentScore( stsKey ){
      return db('CapsimInbox').first().from('inbox_score').where({'FK_studentToSimKey': stsKey,'historyKey':0})
    },
    requestReport(studentKey, simKey){
      return Request.GET(`AssessmentService_1.0/webresources/GenerationService/advancedReport?studentKey=${studentKey}&simKey=${simKey}`)
    },
    getStudentToSimKeyArr( simKey ){
      return db('CapsimInbox').select('sts.studentToSimKey').from('inbox_studentToSim as sts').where( {'sts.FK_simkey': simKey } ).map(row => row.studentToSimKey)
    },
    getStudentToWithScoresSimKeyArr( studentToSimKeyArr ){
      return db('CapsimInbox').select('FK_studentToSimKey').from('inbox_score').whereIn( 'FK_studentToSimKey',studentToSimKeyArr).where( {'historyKey':0} ).map(row => row.FK_studentToSimKey)
    },

    getStudentsLogArr( studentToSimKeyArr , FK_logActionTypeKey){
      return db('CapsimInbox').select().from('inbox_studentLog').whereIn( 'FK_studentToSimKey',studentToSimKeyArr).where( {'historyKey':0, 'FK_logActionTypeKey':FK_logActionTypeKey} ).orderBy('logKey')
    },
    setGameCompletionLog(stsKey, examEndDateTime){
      return db('CapsimInbox').insert({FK_studentToSimKey:stsKey,
        FK_logActionTypeKey:2,
        key:null,
        value:null,
        dateTime: examEndDateTime })
        .into('inbox_studentLog')
    },

    async getStudentToSimKeyArrayToProcess(simKey,versionKey){
      let studentToSimKeyArr = await this.getStudentToSimKeyArr( simKey )
      let hasScoreStudentToSimKeyArr = await this.getStudentToWithScoresSimKeyArr( studentToSimKeyArr )

      let notCompletedStudentToSimKeyArr = studentToSimKeyArr.filter(x => !hasScoreStudentToSimKeyArr.includes(x));
      let startGameStudentLogArr = await this.getStudentsLogArr(notCompletedStudentToSimKeyArr,1)
      let endGameStudentLogArr = await this.getStudentsLogArr(notCompletedStudentToSimKeyArr,2)

      let hasStartedGameStudentToSimKeyArr = startGameStudentLogArr.map(row => row.FK_studentToSimKey)

      let {isExam, versionTimer} = await db('CapsimInbox').first('v.isExam', 'v.timer as versionTimer').from('inbox_version AS v').where( {'v.versionKey':versionKey})
      let sectionSetting = await db('CapsimInbox').first('ss.settingJSON').from('inbox_sectionSetting AS ss').innerJoin(process.env.capstoneDb + 'sim AS s', 's.sectionKey', 'ss.fk_sectionKey').where( {'s.simkey':simKey})
      const studentSettingsObj  = await ss.getSettingsList(hasStartedGameStudentToSimKeyArr)

        let sectionTimer = versionTimer
        if (typeof sectionSetting !== 'undefined'){
            let data = JSON.parse(sectionSetting.settingJSON)
            if(typeof data.exam !== 'undefined'){
                if(typeof data.exam.data.time !== 'undefined'){
                    sectionTimer = data.exam.data.time
                }
            }
        }
        let stsKeyToProcess  = []

        hasStartedGameStudentToSimKeyArr.forEach(stsKey=>{
          
          let studentTimeSpentCap = sectionTimer
          let data = studentSettingsObj[stsKey]
          if (typeof data !== 'undefined'){
              data = JSON.parse(data)
              if(typeof data.assessment !== 'undefined'){
                  if(typeof data.assessment.timer !== 'undefined'){
                      studentTimeSpentCap = data.assessment.timer
                  }
              }
              if(typeof data.webapp !== 'undefined'){
                  if(typeof data.webapp.data.additionalTime !== 'undefined'){
                      studentTimeSpentCap = data.webapp.data.additionalTime
                  }
              }
          }

          let studentLog = startGameStudentLogArr.find(log => log.FK_studentToSimKey === stsKey)
          const studentEndGameLog = endGameStudentLogArr.find(log => log.FK_studentToSimKey === stsKey)
          let timeStarted = Date.parse(studentLog.dateTime) 
          let examTime = (studentTimeSpentCap * 60 * 1000 ) + 1000 // additional second so Exam Completion Time would round up properly
         
          const timeDifferenceBetweenUTCandOurServer = (5 * 60*60 *1000)
          const additionalMinuteForStudentToCloseExam = (60 * 1000)
          if(Date.now() - timeDifferenceBetweenUTCandOurServer > ( timeStarted + examTime + additionalMinuteForStudentToCloseExam ) ){
            let examEndDateTime = new Date(timeStarted + examTime )
            let hasEndTimeLog = (typeof studentEndGameLog != 'undefined')
            stsKeyToProcess.push({stsKey:stsKey,examEndDateTime: examEndDateTime, hasEndTimeLog: hasEndTimeLog})
          }

        })
        return stsKeyToProcess
    },

    async getIsStudentsNeedsToBeProcessed(simKey,versionKey){
      let studentToSimKeyArrayToProcess = await this.getStudentToSimKeyArrayToProcess(simKey,versionKey)
      return studentToSimKeyArrayToProcess.length > 0
    },

    async processStudents(simKey,versionKey){
      let studentToSimKeyArrayToProcess = await this.getStudentToSimKeyArrayToProcess(simKey,versionKey)
      studentToSimKeyArrayToProcess = this.getUnique(studentToSimKeyArrayToProcess,'stsKey')
     
      for(let i = 0; i< studentToSimKeyArrayToProcess.length; i++){
          const stsKey = studentToSimKeyArrayToProcess[i].stsKey
          const examEndDateTime = studentToSimKeyArrayToProcess[i].examEndDateTime
          const hasEndTimeLog = studentToSimKeyArrayToProcess[i].hasEndTimeLog

          if(hasEndTimeLog == false) await this.setGameCompletionLog(stsKey,examEndDateTime)
          
          await gameScore.setScore(stsKey,versionKey)
          await db('CapsimInbox').table('inbox_score')
            .where({
                'FK_studentToSimKey':stsKey,
                'historyKey':0
            })
            .update({ dateTime:examEndDateTime })

            await ss.setSettings( stsKey, 'completed', true, 'assessment' ) 
            await this.setAdditionalLog( simKey, stsKey, versionKey )
            await this.automatedClearStudentScore( simKey, stsKey )
        }
        return true

      // Concurrently processing all students, knext breaks down when processing more than 15 students at the time 
      // const list = []
      // studentToSimKeyArrayToProcess.forEach(item => list.push({"simKey":simKey
      // ,"versionKey":versionKey
      // ,"stsKey":item.stsKey
      // ,"examEndDateTime": item.examEndDateTime
      // ,"hasEndTimeLog":item.hasEndTimeLog}) )
      // await Promise.all(list.map(item => this.processSingleStudent(item))) 
    },

    // async processSingleStudent({simKey,versionKey,stsKey,examEndDateTime,hasEndTimeLog}) {
    //   if(hasEndTimeLog == false) await this.setGameCompletionLog(stsKey,examEndDateTime)
      
    //   await gameScore.setScore(stsKey,versionKey)
    //   await db('CapsimInbox').table('inbox_score')
    //     .where({
    //         'FK_studentToSimKey':stsKey,
    //         'historyKey':0
    //     })
    //     .update({ dateTime:examEndDateTime })

    //     await ss.setSettings( stsKey, 'completed', true, 'assessment' ) 
    //     await this.setAdditionalLog( simKey, stsKey, versionKey )
    //     await this.automatedClearStudentScore( simKey, stsKey )
    // },

    getUnique(arr, comp) {

      const unique = arr
           .map(e => e[comp])
    
         // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)
    
        // eliminate the dead keys & store unique objects
        .filter(e => arr[e]).map(e => arr[e]);
    
       return unique;
    }
    
    

    
})


