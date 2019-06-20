
const db = require('./db.js'),
Version = require('../resources/version'),
Helper = require('./helper'),
Request = require('../lib/request'), 
studentSettings = require('./studentSetting'), 
sectionSettings = require('./sectionSettings'), 
numberFormatter = require('accounting')

GameData = function( data ) { return Object.assign( this, data ) }


module.exports = Object.assign( GameData.prototype, {

    getAnswerSkills(){
        return db('CapsimInbox').select(
            'ats.FK_answerKey',
            's.skillKey',
            'ats.points',
            's.name'
        )
        .from('inbox_answerToSkill AS ats')
        .innerJoin('inbox_skill AS s', 's.skillKey', 'ats.FK_skillKey')
    },

    getVersionInfo( versionKey ) {
        return db('CapsimInbox').select(
                'inbox_version.isExam'
            )
            .from('inbox_version')
            .where({ 'versionKey': versionKey })
            .first()
    },

    getExamQuestionGroupsArray( stsKey ) {
        return db('CapsimInbox')
            .select('FK_questionGroupKey')
            .from('inbox_questionGroupToSim AS qgts')
            .innerJoin('inbox_studentToSim AS sts', 'sts.FK_simKey', 'qgts.FK_simKey')
            .where('sts.studentToSimKey' , stsKey)
            .map(row => row.FK_questionGroupKey)
    },

    async getParallelQuestions(versionKey, isExam, stsKey){
        const questions = await this.getQuestions(versionKey,isExam)

        let questionGroups = {}
        questions.forEach( question => {
            (questionGroups.hasOwnProperty(question.FK_questionGroupKey))
            ? questionGroups[question.FK_questionGroupKey].push(question)
            : questionGroups[question.FK_questionGroupKey]= [question]
        })

      
        const retVal = []
       
        if(versionKey == 70){
            const examQuestionGroupsArray = await this.getExamQuestionGroupsArray(stsKey)
            for (let key in questionGroups) {
                if (examQuestionGroupsArray.includes(parseInt(key))){
                    retVal.push(Helper.shuffle(questionGroups[key], stsKey)[0])
                }
            }
        }else{
            for (let key in questionGroups) {
                retVal.push(Helper.shuffle(questionGroups[key], stsKey)[0])
            }
        }
      

        
        return retVal

    },

    async getQuestions(versionKey, isExam){
        // Fix: Come back later to decide if version should be checked to joined competency, distinct will bring back an array
        if(isExam == 1 ){
            return db('CapsimInbox').select(
                'q.questionKey',
                'q.maxAnswerCount',
                'q.dependsOn',
                'q.subjectTagKey',
                'q.descriptionTagKey',
                'q.timer',
                'q.FK_questionDisplayTypeKey',
                'a.nameTagKey as authorNameTagKey',
                'a.title as authorTitle',
                'qdt.name as questionDisplayType',
                'q.sequence', 
                'ic.competencyKey as competencyKey',                 
                'ic.name as competencyName',
                'q.FK_questionTypeKey',
                'q.FK_questionGroupKey',
                'q.isWrittenResponse'
                // 'sta.FK_answerkey as isSent'                              
            )
            .from('inbox_question AS q')
            .innerJoin('inbox_author AS a','a.authorKey','q.FK_authorKey')
            .innerJoin('inbox_questionDisplayType AS qdt','qdt.questionDisplayTypeKey','q.FK_questionDisplayTypeKey')
            .innerJoin('inbox_questionToVersion AS qtv','qtv.FK_questionKey','q.questionKey')
            .innerJoin('inbox_version AS v','v.versionKey','qtv.FK_versionKey')
            .innerJoin('inbox_answer AS ia','ia.FK_questionKey','q.questionKey')
            .innerJoin('inbox_answerToCompetency AS iatc','ia.answerKey','iatc.FK_answerKey')
            .innerJoin('inbox_competency AS ic','iatc.FK_competencyKey','ic.competencyKey')  
            .innerJoin('inbox_questionGroup AS qg','qg.questionGroupKey','q.FK_questionGroupKey')   
            // .leftJoin('inbox_studentToAnswer AS sta', 'sta.FK_answerkey', 'ia.answerKey')            
            .where({ 'qg.FK_versionKey': versionKey })
        }else {
            return db('CapsimInbox').select(
                'q.questionKey',
                'q.maxAnswerCount',
                'q.dependsOn',
                'q.subjectTagKey',
                'q.descriptionTagKey',
                'q.timer',
                'q.FK_questionDisplayTypeKey',
                'a.nameTagKey as authorNameTagKey',
                'a.title as authorTitle',
                'qdt.name as questionDisplayType',
                'q.sequence',
				'q.FK_questionTypeKey',
                'q.FK_questionGroupKey',
                'q.isWrittenResponse',
                'q.isSmartThreading',
                'q.failsafe',
                'q.triggeredInCycle'
            )
            .from('inbox_question AS q')
            .innerJoin('inbox_author AS a','a.authorKey','q.FK_authorKey')
            .innerJoin('inbox_questionDisplayType AS qdt','qdt.questionDisplayTypeKey','q.FK_questionDisplayTypeKey')
            .innerJoin('inbox_questionToVersion AS qtv','qtv.FK_questionKey','q.questionKey')
            .innerJoin('inbox_version AS v','v.versionKey','qtv.FK_versionKey')
            .innerJoin('inbox_questionGroup AS qg','qg.questionGroupKey','q.FK_questionGroupKey')
            .where({ 'qg.FK_versionKey': versionKey })
        }
    },
	getStudentAnswers( FK_studentToSimKey ){
        return db('CapsimInbox')
        .select(
            'a.answerKey',
            'a.timeImpact',
            'a.FK_questionKey',
            'a.nameTagKey',
            // 'a.isDynamic',
            'at.answerTypeKey',
            'at.name AS answerType'
        )
        .from('inbox_studentToAnswer AS sta')
        .innerJoin('inbox_answer AS a', 'a.answerKey', 'sta.FK_answerKey')
        .innerJoin('inbox_answerType AS at', 'at.answerTypeKey', 'a.FK_answerTypeKey')
		.where( {'sta.FK_studentToSimKey': FK_studentToSimKey, 'sta.historyKey':0 } )
    },
    getWrittenAnswers( FK_studentToSimKey ){ 
        return db('CapsimInbox')
        .select()
		.from('inbox_studentToAnswerWritten AS staw')
		.where( 'staw.FK_studentToSimKey', FK_studentToSimKey )
    },
    getWrittenAnswer( FK_StudentToSimKey, FK_questionKey ){
        return db('CapsimInbox')
        .select()
		.from('inbox_studentToAnswerWritten AS staw')
        .where({"FK_StudentToSimKey":FK_StudentToSimKey, "FK_questionKey":FK_questionKey })
    },
    getWrittenDrafts( FK_StudentToSimKey, FK_questionKey ){
        return db('CapsimInbox')
        .select()
		.from('inbox_studentToAnswerDraft AS staw')
        .where({"FK_StudentToSimKey":FK_StudentToSimKey})
    },
    
    getWrittenDraft( FK_StudentToSimKey, FK_questionKey ){
        return db('CapsimInbox')
        .select()
		.from('inbox_studentToAnswerDraft AS staw')
        .where({"FK_StudentToSimKey":FK_StudentToSimKey, "FK_questionKey":FK_questionKey })
    },
    
    
    getAnswers(FK_versionKey) {
        try {
            // Come back later to decide if version should be checked to include isDynamic
            return db('CapsimInbox').select(
                'a.answerKey',
                'a.timeImpact',
                'a.FK_questionKey',
                'a.nameTagKey',
                // 'a.isDynamic',
                'a.sequence',
                'a.isNotRandomized',
                'at.answerTypeKey',
                'at.name AS answerType'
            )
            .from('inbox_answer AS a')
            .innerJoin('inbox_answerType AS at', 'at.answerTypeKey', 'a.FK_answerTypeKey')
            .innerJoin('inbox_questionToVersion AS qtv', 'qtv.FK_questionKey', 'a.FK_questionKey')
            .where( 'qtv.FK_versionKey', FK_versionKey )
            .orderBy('a.sequence','ASC')
        } catch (error) {
            console.log(error);
        }
    },

    getFiles(FK_versionKey) {
        return db('CapsimInbox').select().from('inbox_file').innerJoin('inbox_fileToFileFolder AS FTFF','FTFF.FK_fileKey','inbox_file.fileKey').where({ FK_versionKey })
    },

    getQuestionFiles(FK_versionKey) {
        return db('CapsimInbox').select(
            // 'f.displayName'
        )
        .from('inbox_fileToQuestion AS ftq')
        .innerJoin('inbox_file AS f','f.fileKey','ftq.FK_fileKey')
        .innerJoin('inbox_question AS q','q.questionKey','ftq.FK_questionKey')
        .innerJoin('inbox_questionToVersion AS qtv','qtv.FK_questionKey','q.questionKey')
        .where({ 'f.FK_versionKey':FK_versionKey })
    },
    
    getFolders(FK_versionKey) {
        return db('CapsimInbox').select().from('inbox_fileFolder').where({ FK_versionKey })
    },

    async getSimulationData(versionKey, stsKey, isExam) {
        return Promise.all([this.getParallelQuestions(versionKey, isExam, stsKey), this.getAnswers(versionKey), this.getFiles(versionKey), this.getFolders(versionKey), this.getQuestionFiles(versionKey), this.getStudentAnswers(stsKey), this.getWrittenAnswers(stsKey), this.getWrittenDrafts(stsKey), this.getDependencies(versionKey), this.getStudentLogEntries(stsKey, [2, 3, 10, 13])])    
    },

    async getVersionData(stsKey) {
        return await db('CapsimInbox')
        .select('versionKey','FK_studentKey', 'vts.simKey as simKey')
        .from('inbox_versionToSim AS vts')
        .join('inbox_studentToSim AS sts', 'vts.simKey', 'sts.FK_simKey')
        .where({ 'sts.studentToSimKey': stsKey })
        .first();
    },

    formatEmails([questions, answers, files, folders, questionFiles, studentAnswers, writtenAnswers, writtenDrafts, dependencies, answerLog], version, cycle, isReEntry) {
        for(let i = 0; i < questions.length; i++ ){
            questions[i].files = questionFiles.filter(function(questionFile){ return questionFile.FK_questionKey == questions[i].questionKey })
          
            questions[i].answers = answers.filter( function(answer) { 
                // Fix: 
                // Resolve later, question keys will be an array because of knex distinct call
                // This shouldnt happen, will put in a dirty fix here. 
                if(Array.isArray(questions[i].questionKey)){
                    questions[i].questionKey = questions[i].questionKey.pop()
                }
                return answer.FK_questionKey == questions[i].questionKey 
            });

            questions[i].dependencies = dependencies.filter( function(dependency){
                return dependency.FK_questionKey == questions[i].questionKey 
            })

            let isSent = false
            // Fix the multiple answer problem later
            studentAnswers.forEach(function(answer) {     
                if(answer.FK_questionKey == questions[i].questionKey) {
                    isSent = true
                    // answerPicked() on front end requires an answer object if isSent is true
                    questions[i].answer = []
                    questions[i].answer.push(answer)
                }
            });
            writtenAnswers.forEach(function(writtenAnswer){   
                if(writtenAnswer.FK_questionKey == questions[i].questionKey) {  
                    isSent = true; 
                    // currentEmail.writtenResponse is used on front end
                    questions[i].writtenResponse = ""
                    questions[i].writtenResponse = writtenAnswer.writtenResponse; 
                }
            });  
            writtenDrafts.forEach(function(writtenDraft){   
                if(writtenDraft.FK_questionKey == questions[i].questionKey) {  
                    // currentEmail.writtenResponse is used on front end
                    questions[i].writtenDraftResponse = ""
                    questions[i].writtenDraftResponse = writtenDraft.writtenResponse; 
                }
            });  
            questions[i].isSent = isSent
        }
        
        const emails = questions.filter(function(element){ return element.FK_questionDisplayTypeKey == 1; })
        const messages = questions.filter(function(element){ return element.FK_questionDisplayTypeKey == 2; })
        const allEmails = emails.filter(e => e.failsafe != 1)
        const allAnswerArr = []
        allEmails.map(e => {
            e.answers.map(a =>{
                allAnswerArr.push(a.answerKey)
            })
        })
        const selectedSmartThreadingAnswers = []
        let recentlySelectedAnswerKey = null
        let deliveredEmailsLog = []
        let assessmentComplete = false
        //get all delivered messages
        answerLog.map((l)=>{
            if(l.FK_logActionTypeKey == 13){
                deliveredEmailsLog.push(+l.key)
            }
            if(l.FK_logActionTypeKey == 2){
                assessmentComplete = true
            }
        }) 
        if(isReEntry){
            let lastIndex = answerLog.length-1
            answerLog.map((l, i)=>{
                //get all smart threading answers from log
                if( l.FK_logActionTypeKey == 10  && allAnswerArr.indexOf(+l.value) > -1 ){
                    selectedSmartThreadingAnswers.push(+l.value)
                }
                // get most recent answer in log
                if( i == lastIndex && allAnswerArr.indexOf(+l.value) > -1 ){
                    recentlySelectedAnswerKey = l.value
                }
            }) 
           
        }
        return { emails, messages, files, folders, timer: version.get('timer'), cycle, selectedSmartThreadingAnswers, recentlySelectedAnswerKey, deliveredEmailsLog, assessmentComplete }
    },

    async buildSimulationData(stsKey, sectionKey, demoVersion, isForProfessorReport, isReEntry) {
        let versionKey = 0
        let simKey = 0
        let studentKey = 0
        if(demoVersion) {
            versionKey = demoVersion
        }
        else {
            const version = await this.getVersionData(stsKey)
            versionKey = version.versionKey
            simKey = version.simKey
            studentKey = version.FK_studentKey; 
        }
        const version = await Version.where({ versionKey }).fetch(); 
        const isExam = version.get('isExam')
        let cycleKey = null
        if(isReEntry){
            let cycle = await this.getCycle(stsKey)
            if(!cycle) cycle = await this.setCycle(stsKey)
            cycleKey = cycle.FK_cycleKey
        }
        const simulation =  await this.getSimulationData(versionKey, stsKey, isExam); 
        const simulationData = this.formatEmails(simulation, version, cycleKey, isReEntry); 
        if(isExam == 1) {
            simulationData.emails = Helper.shuffle(simulationData.emails, stsKey)
            // simulationData.emails = await this.evalEmails(simulationData.emails, studentKey, simKey); 
            simulationData.emails = Helper.order(simulationData.emails); 
            simulationData.timer =await this.getStudentTimer(simulationData.timer, simKey, stsKey)
            // Randomizing answers
            let isRandomizeAnswers = true
            let settingJSON = await sectionSettings.getSettings(simKey)
            if (settingJSON !== undefined){
                let sectionSetting = JSON.parse(settingJSON.settingJSON)
                if(sectionSetting.exam !== undefined && sectionSetting.exam.data !== undefined && sectionSetting.exam.data.isNotRandomizeAnswers == true)
                    isRandomizeAnswers = false
            }
            if(isRandomizeAnswers == true) simulationData.emails = Helper.shuffleAnswers(simulationData.emails, stsKey)

            simulationData.advancedReport = await this.requestReport(studentKey, simKey); 

            if( isForProfessorReport != 1){
                let studentSettingJSON =  await studentSettings.getSettings(stsKey)
                if (studentSettingJSON !== undefined){
                    studentSettingJSON = JSON.parse(studentSettingJSON.settingJSON)
                    if (studentSettingJSON.assessment !== undefined){
                        if (studentSettingJSON.assessment.clearedCompetencies !== undefined){
                            simulationData.emails = simulationData.emails.filter(function(element){ return studentSettingJSON.assessment.clearedCompetencies.includes(element.competencyKey) })
                        }
                    }
                }
            }
        }
        return simulationData ; 
    },

    // logActionTypeKey	name
    // 1	Start Game
    // 2	Complete Game
    // 3	Submit Answer
    // 4	Open Message
    // 5	Open Email
    // 6	Open File
    // 7	Click Important
    // 8    Cleared Scores
    // 9    Restored Scores
    // 10   Answer Smart Threading Question
    setLog({ FK_studentToSimKey, FK_logActionTypeKey, key = null, value = null }){
        return db('CapsimInbox').insert({
            FK_studentToSimKey,
            FK_logActionTypeKey,
            key:key,
            value:value
        })
        .into('inbox_studentLog')
    },

    getStudentLog(FK_studentToSimKey) {
        // Convert to string so we can strip out time zones from the knex date object
        const rawQuery =  'convert(varchar(50), [dateTime] , 120) as [dateTime]'
        return db('CapsimInbox')
        .first(db('Core').raw(rawQuery))
        .from('inbox_studentLog')
        .where({'FK_studentToSimKey': FK_studentToSimKey,'historyKey':0})
        .andWhere('FK_logActionTypeKey', 1)
        .orderBy('dateTime','ASC')
        .then((result) => {
            if (result === undefined || result === null)
                return { inProgress: false }
            result.inProgress = true 
            return result
        })
    },

    getStudentLogEntries(FK_studentToSimKey, FK_logActionTypeKeyArr) {
        let retVal = db('CapsimInbox')
        .select()
        .from('inbox_studentLog')
        .where('FK_studentToSimKey', FK_studentToSimKey)
        .orderBy('dateTime','ASC')

        //only get log action types 3 and 10 which are used for smart threading
        if(FK_logActionTypeKeyArr){
            retVal = retVal.whereIn('FK_logActionTypeKey', FK_logActionTypeKeyArr)
        }
        return retVal
    },

    setMultiLog(data){
        return db('CapsimInbox').insert(data)
        .into('inbox_studentLog')
    },

    setAnswer([ FK_studentToSimKey, FK_questionKey, FK_answerKey ]) {
        return db('CapsimInbox').insert({
            FK_studentToSimKey,
            FK_questionKey,
            FK_answerKey
        })
        .into('inbox_studentToAnswer')
    },
    
    setWrittenAnswer( {FK_StudentToSimKey, FK_questionKey, writtenResponse} ) {
        return db('CapsimInbox').insert({
            FK_StudentToSimKey,
            FK_questionKey,
            writtenResponse
        })
        .into('inbox_studentToAnswerWritten')
    }, 
    
    setWrittenDraft( {FK_StudentToSimKey, FK_questionKey, writtenResponse} ) {
        return db('CapsimInbox').insert({
            FK_StudentToSimKey,
            FK_questionKey,
            writtenResponse
        })
        .into('inbox_studentToAnswerDraft')
    }, 
    
    updateWrittenDraft( {FK_StudentToSimKey, FK_questionKey, writtenResponse} ) {
        return db('CapsimInbox')
            .table('inbox_studentToAnswerDraft')
            .where({
                'FK_StudentToSimKey':FK_StudentToSimKey,
                'FK_questionKey':FK_questionKey
            })
            .update({'writtenResponse':writtenResponse})
    }, 

    updateEmail ([ old_studentToSimKey, old_questionKey, old_answerKey ], [ FK_answerKey ]) {
        return db('CapsimInbox')
            .table('inbox_studentToAnswer')
            .where({
                'FK_studentToSimKey':old_studentToSimKey,
                'FK_questionKey':old_questionKey,
                'FK_answerKey':old_answerKey,
                'historyKey':0
            })
            .update({
                FK_answerKey
            })
    },

    deleteEmail ([ old_studentToSimKey, old_questionKey, old_answerKey ]) {
        return db('CapsimInbox')
            .table('inbox_studentToAnswer')
            .whereIn('FK_answerKey', old_answerKey)
            .andWhere({
                'FK_studentToSimKey':old_studentToSimKey,
                'FK_questionKey':old_questionKey,
                'historyKey':0
            })
            .del()
    },

    setMultiAnswer(data) {
        return db('CapsimInbox').insert(data)
        .into('inbox_studentToAnswer')
    },    

    clearStudent(FK_studentToSimKey) {
        return db('CapsimInbox').table('inbox_studentToAnswer').where({ FK_studentToSimKey,'historyKey':0 }).del()
        .then( () => db('CapsimInbox').table('inbox_studentLog').where({ FK_studentToSimKey,'historyKey':0 }).del() )
        .then( () => db('CapsimInbox').table('inbox_score').where({ FK_studentToSimKey,'historyKey':0 }).del() )
    },

    requestReport(studentKey, simKey){
        return Request.GET(`AssessmentService_1.0/webresources/GenerationService/advancedReport?studentKey=${studentKey}&simKey=${simKey}`)
    },
    
    getStudentAnswer( {FK_studentToSimKey, FK_questionKey} ){
		return db('CapsimInbox').select(
			'FK_answerKey',
			'FK_questionKey'
		)
		.from('inbox_studentToAnswer')
		.where( {'FK_studentToSimKey':FK_studentToSimKey, 'FK_questionKey':FK_questionKey, 'historyKey':0} )
    },

    async getStudentTimer(timer, simKey, stsKey) {
        // check to see if they already started taking the exam
        const examTime = Helper.concat(timer, await sectionSettings.getSettings(simKey), await studentSettings.getSettings(stsKey)); 
        const log = await this.getStudentLog(stsKey)
        if (log.inProgress) {
            return Helper.timeDifference(examTime, log.dateTime)
        }
        return examTime
    }, 

    async getVersionTimer(versionKey){
        const version = await Version.where({ versionKey }).fetch(); 
        return version.get('timer')
    },
    
    geQuestionTypeKey( questionKey ){
		return db('CapsimInbox').first(
			'FK_questionTypeKey'
		)
		.from('inbox_question')
		.where( questionKey )
    },
    
    getDependencies(versionKey){
        return db('CapsimInbox').select(
            'qtdo.FK_questionKey',
            'qtdo.FK_answerKey'
        )
        .from('inbox_questionToDependsOn AS qtdo')
        .innerJoin('inbox_questionToVersion AS qtv','qtv.FK_questionKey','qtdo.FK_questionKey')
        .where({ 'qtv.FK_versionKey': versionKey})
    },

    async getCycle(FK_studentToSimKey ){
        return db('CapsimInbox').select()
        .from('inbox_cycleToStudent')
        .where({ FK_studentToSimKey })
        .first()
    },

    async setCycle(FK_studentToSimKey){
        data = {
            FK_studentToSimKey: FK_studentToSimKey,
            FK_cycleKey: 1
        }
        return db('CapsimInbox').insert(data)
        .into('inbox_cycleToStudent')
    },

    async advanceCycle(FK_studentToSimKey){
        let currentCycle = await db('CapsimInbox').select().from('inbox_cycleToStudent').where({FK_studentToSimKey}).first()
        let newRound = currentCycle.FK_cycleKey + 1
        return db('CapsimInbox')
        .table('inbox_cycleToStudent')
        .where({
            'FK_studentToSimKey':FK_studentToSimKey,
        })
        .update({'FK_cycleKey': newRound})
    }


})
