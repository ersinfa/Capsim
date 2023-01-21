const db = require('./db.js')
const cd = require('./calcData.js')
const rd = require('./reportData.js')
const Skill = require('../resources/skill')
const Competency = require('../resources/competency')
const camelCase = require('lodash').camelCase
const studentSettings = require('./studentSetting')
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

ProfessorReport = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( ProfessorReport.prototype, {

    /**
     * Provides data needed for professor skill scores report and course roster report
     *
     * @param {Number} [sectionkey]
     *
     * @returns {Object}
     */
    async getSkillScoreReport({ simKey, versionKey }) {

        let {isExam, versionTimer} = await db('CapsimInbox').first('v.isExam', 'v.timer as versionTimer').from('inbox_version AS v').where( {'v.versionKey':versionKey})
        let sectionSetting = await db('CapsimInbox').first('ss.settingJSON').from('inbox_sectionSetting AS ss').innerJoin(process.env.capstoneDb + 'sim AS s', 's.sectionKey', 'ss.fk_sectionKey').where( {'s.simkey':simKey})
        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
        .from(process.env.capstoneDb + 'section as section')
        .innerJoin(process.env.capstoneDb + 'sim as sim','section.sectionkey','sim.sectionkey')
        .where({"simkey":simKey})
        timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'

        const simMeasurementKeys       = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
        const simCompetencyKeyArr      = [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))]

        let scoreAll            = await rd.getScoreAll( versionKey )
        let students            = await rd.getStudents( simKey )
        let studentKeyArr       = students.map( row => row.studentKey )

        // Get stsKey's, worried about editing existing code to get stsKey's, so using new one
        let stsKeyArr                   = await rd.getStudentToSimKeys( studentKeyArr, simKey)
        let stsKeyArray                 = Object.values(stsKeyArr)

        let studentsGoal                = await rd.getStudentsGoal( stsKeyArray)

        let studentsRawScore            = await rd.getStudentsRawScore( stsKeyArray, timeZoneInfo)
        let studentsSelfScore           = await rd.getStudentsSelfScore( stsKeyArray)
        let writtenResponses            = await rd.getWrittenResponses( stsKeyArray )
        let files                       = await rd.getStudentFiles(stsKeyArray)

        let skills                      =  await Skill.where('skillKey','in', simSkillKeyArr ).fetchAll()
        const competencies		        = await Competency.where({ FK_versionKey: versionKey }).fetchAll()
        let posibleCompetenciesScore    = await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.COMPETENCY)

        let competencies2	            = await db('CapsimInbox').select().from('inbox_competency AS c').whereIn( 'c.competencyKey',simCompetencyKeyArr)
        let possibleSkillPoints         = await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.SKILL)
        let {nSkills}                   = await db('CapsimInbox').table('inbox_skill').where({ FK_versionKey: versionKey }).count('skillKey AS nSkills').first()
        const studentSettingsObj        = await studentSettings.getSettingsList(Object.values(stsKeyArr))
        const {maxOverallScoreGotten}     = await db('CapsimInbox').first().max('overall as maxOverallScoreGotten').from('inbox_score').whereIn( 'FK_studentToSimKey',stsKeyArray).where({'historyKey':0})

        let studentsList        = {}
        let retVal              = []
        let averages            = []
        let overallSum          = 0
        let completeCount       = 0
        let skillSum            = {}



        // Section assessment time cap
        let sectionTimer = versionTimer
        if (typeof sectionSetting !== 'undefined'){
            let data = JSON.parse(sectionSetting.settingJSON)
            if(typeof data.exam !== 'undefined'){
                if(typeof data.exam.data.time !== 'undefined'){
                    sectionTimer = data.exam.data.time
                }
            }
        }
        // ===================================
        
        
        students.forEach( student => {
            studentsList[student.studentKey] = student
            studentsList[student.studentKey].selfSkillScore = {}
            studentsList[student.studentKey].rawSkillScore = {}
            studentsList[student.studentKey].competencies = {}
        })

        //this is part of the reentry logic, raw score is empty so need to get stsKey into studentList here
        if(studentsRawScore.length < 1){
            for(let studentKey in stsKeyArr){
                studentsList[studentKey].stsKey = stsKeyArr[studentKey]
            }
        }
      

        studentsRawScore.forEach( rawScore => {
            studentsList[rawScore.FK_studentKey].rawSkillScore = JSON.parse( rawScore.skills )
            studentsList[rawScore.FK_studentKey].rawOverall = rawScore.overall
            studentsList[rawScore.FK_studentKey].InboxCompletionDate = moment.utc(rawScore.localDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a') 
            studentsList[rawScore.FK_studentKey].InboxTimeSpent = rawScore.timeSpent
            studentsList[rawScore.FK_studentKey].stsKey = rawScore.FK_studentToSimKey
			studentsList[rawScore.FK_studentKey].competencies = JSON.parse(rawScore.competencies)
        })

        studentsSelfScore.forEach( selfScore => {
            studentsList[selfScore.FK_studentKey].selfSkillScore[selfScore.FK_skillKey] = selfScore.points
        })

        studentsGoal.forEach( studentGoal => {
            studentsList[studentGoal.FK_studentKey].IDPCompletionDate = studentGoal.dateTime
        })

        // Calculates score for every student
        for (let key in studentsList) {
            let studentPassword = ''
            let isInProgress = false
            let studentSettings = studentSettingsObj[stsKeyArr[key]]

            if (typeof studentSettings !== 'undefined'){
                studentSettings = JSON.parse(studentSettings)
                
                if(typeof studentSettings.assessment !== 'undefined'){
                    if(typeof studentSettings.assessment.password !== 'undefined'){
                        studentPassword = studentSettings.assessment.password
                    }
                    if(typeof studentSettings.assessment.clearedScore !== 'undefined'){
                        isInProgress = true
                    }
                }
            }
            
            let skillsScores = {}
            let studentWrittenResponses = writtenResponses.filter(response => {
                return response.FK_StudentToSimKey == studentsList[key].stsKey 
            })
            let studentFiles = files.filter(file => {
                return file.FK_studentToSimKey == studentsList[key].stsKey 
            })     
            if(typeof studentsList[key].rawOverall != 'undefined' ){
                let pSkillScore = (isExam == 1)
                    ? studentsList[key].rawSkillScore 
                    // ? rd.getSkillPercentageScore(studentsList[key].rawSkillScore, skills, possibleSkillPoints) 
                    : cd.skillScore(studentsList[key].rawSkillScore, scoreAll.skills)
                let selfAwarenessScore  = cd.selfAwarenessScore(pSkillScore, studentsList[key].selfSkillScore).selfAwarenessScore
                let devIndex            = cd.developmentIndex(pSkillScore, versionKey, nSkills)
                let overall = null 
                let overallAdjusted = 0 
                
                if(isExam == 1){
                    let possibleSkillPointSum = cd.sumObjectKeyValues(possibleSkillPoints)
                    let studentSkillPointSum = cd.sumObjectKeyValues(studentsList[key].rawSkillScore)

                    overall = cd.calcPercentage(studentSkillPointSum,possibleSkillPointSum)
                    overallAdjusted = cd.calcPercentage(studentSkillPointSum,maxOverallScoreGotten)
                    overallAdjusted = (isNaN(overallAdjusted))? 100 : overallAdjusted
                }else{
                    overall = +cd.calcPercentile( studentsList[key].rawOverall ,scoreAll.overall )
                }
                

                overallSum+=overall
                completeCount++
                // Caps out time spent for display
                let inboxTimeSpent = studentsList[key].InboxTimeSpent
                let studentTimeSpentCap = sectionTimer
                if(isExam == 1) {
                    let data = studentSettingsObj[studentsList[key].stsKey]
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
                }
                if(inboxTimeSpent>studentTimeSpentCap){
                    inboxTimeSpent = studentTimeSpentCap
                }
                // =============================================

                const reportObject = {
                    name               : studentsList[key].LastName + ", " + studentsList[key].FirstName,
                    stsKey             : studentsList[key].stsKey,
                    overall            : +overall.toFixed(0)+(isExam == 1?'%':''),
                    overallAdjusted    : +overallAdjusted.toFixed(0)+(isExam == 1?'%':''),
                    selfAwareness      : selfAwarenessScore,
                    developmentIndex   : devIndex.label1 + ", " + devIndex.label2,
                    inboxCompletion    : studentsList[key].InboxCompletionDate,
                    inboxTimeSpent     : inboxTimeSpent + ' minutes',
                    IDPCompletion      : (studentsList[key].IDPCompletionDate !== undefined ) ? studentsList[key].IDPCompletionDate : '-',
                    writtenResponses   : studentWrittenResponses,
                    files              : studentFiles,
                    password           : studentPassword,
                    isInProgress       : false
                }

		        // Fix, refactor the config extraction, when we have time
                if(isExam == 1) {
                    let data = studentSettingsObj[studentsList[key].stsKey]
                    let additionalTime = -1
                    if (typeof data !== 'undefined'){
                        data = JSON.parse(data)
                        if(typeof data.assessment !== 'undefined'){
                            if(typeof data.assessment.timer !== 'undefined'){
                                additionalTime = data.assessment.timer
                            }
                        }
                        if(typeof data.webapp !== 'undefined'){
                            if(typeof data.webapp.data.additionalTime !== 'undefined'){
                                additionalTime = data.webapp.data.additionalTime
                            }
                        }
                    }
                    if(additionalTime == -1) additionalTime = '-'
                    
                    reportObject.additionalTime = additionalTime; 
                }

                skills.forEach( skill => {
                    const key = `${camelCase(skill.get('name'))}`
                    const value = Math.round(parseInt(pSkillScore[`${skill.get('skillKey')}`]*100))/100
                    // const value = Math.round(parseInt(pSkillScore[`${skill.get('skillKey')}`]))
                    skillsScores[key] = value
                    if(typeof skillSum[key] != 'undefined' ){skillSum[key]+=value}else{skillSum[key] = value}
                })


                const  cScore = cd.calcCompetencyPercentageScore(studentsList[key].competencies,competencies2,posibleCompetenciesScore,1)

                retVal.push(Object.assign(reportObject, skillsScores, {
					competencies: cScore
                }))

                averages.push(cScore) 

            } else {
                // stsKey, was blank before, but exam needs the Key. Keep this in mind if something breaks 
                const reportObject = {
                    name               : studentsList[key].LastName + ", " + studentsList[key].FirstName,
                    stsKey             : stsKeyArr[key],
                    overall            : '-',
                    overallAdjusted    : '-',
                    selfAwareness      : '-',
                    developmentIndex   : '-',
                    inboxCompletion    : '-',
                    inboxTimeSpent     : '-',
                    IDPCompletion      : '-',
                    files              : studentFiles,
                    password           : studentPassword,
                    isInProgress       : isInProgress
                }

		        // Fix, refactor the config extraction, when we have time
                if(isExam == 1) {
                    // let data = studentSettingsObj[studentsList[key].stsKey]
                    let data = studentSettingsObj[stsKeyArr[key]]
                    let additionalTime = -1
                    if (typeof data !== 'undefined'){
                        data = JSON.parse(data)
                        if(typeof data.assessment !== 'undefined'){
                            if(typeof data.assessment.timer !== 'undefined'){
                                additionalTime = data.assessment.timer
                            }
                        }
                        if(typeof data.webapp !== 'undefined'){
                            if(typeof data.webapp.data.additionalTime !== 'undefined'){
                                additionalTime = data.webapp.data.additionalTime
                            }
                        }
                    }
                    if(additionalTime == -1) additionalTime = '-'
                    reportObject.additionalTime = additionalTime; 
                }

                skills.forEach( skill => {
                    let key = `${camelCase(skill.get('name'))}`
                    let value = 0
                    skillsScores[key] = value
                })

                competencies.forEach( comp => studentsList[key].competencies[comp.get('name')] = 0 )

                const  cScore = cd.calcCompetencyPercentageScore(studentsList[key].competencies,competencies2,posibleCompetenciesScore)

                retVal.push(Object.assign(reportObject, skillsScores, {
					competencies: cScore
                }))

            }
        }
        
        let skillsAverage = {}

        skills.forEach( skill => {
            let key = `${camelCase(skill.get('name'))}`
            skillsAverage[key] = {
                score: (completeCount > 0)? (skillSum[key]/completeCount).toFixed(0) : '-'
                ,name : skill.get('name')
                ,description: skill.get('description')
            }
        })

        let classAverage = {
            overall: (completeCount > 0)? (overallSum/completeCount).toFixed(0) : '-'
            ,skills: skillsAverage
        }

        
        return { report: retVal, skills, averages: cd.calcAverages(averages), examsCompleted : averages.length, classAverage }
     },

     async getAolReport ({ versionKey, simKey }) {
        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)
        const simMeasurementKeys    = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const versionLearningGoalKeyArr    = [...new Set(simMeasurementKeys.map(row => row.FK_learningGoalKey))]
        let simLearningGoalsScore     = await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.LEARNING_GOAL)
        let params = {
            "whereIn":{
                "column": "learningGoalKey",
                "values": versionLearningGoalKeyArr
            }
        }
        let rawGoals	= await rd.getMeasurement(constants.MEASUREMENT_TYPE_KEY.LEARNING_GOAL, params) 
        const studentKeyArr                 = await rd.getStudents( simKey )
            .then(students => students.map(student => student.studentKey))
        let stsKeyArr                   = await rd.getStudentToSimKeys( studentKeyArr, simKey)
        let stsKeyArray                 = Object.values(stsKeyArr)
        
      
        const learningGoalReport = await rd.getStudentsLearningGoal(stsKeyArray)
            .then(students => students.map(async (goal) => {
                const score = rd.getLearningGoalPercentageScore(goal.learningGoals, rawGoals, simLearningGoalsScore)
                return {
                    name: goal.LastName + ', ' + goal.FirstName, 
                    score: score
                }
            }))

        // Return one promise to resolve the async map function
        return await Promise.all(learningGoalReport)
            .catch(error => {
                console.log(error)
                return []
            })
    },
    // Get averages of the section for skills, but grouped by competency
    // Here is the kicker, there is no relationship between competencies and skills. Fun ensues...
    async getAveragesReport({ versionKey, simKey }) {
         const studentKeyArr = await rd.getStudents( simKey )
             .then(students => students.map(student => student.studentKey))

        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)
        let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
        .from(process.env.capstoneDb + 'section as section')
        .innerJoin(process.env.capstoneDb + 'sim as sim','section.sectionkey','sim.sectionkey')
        .where({"simkey":simKey})
        
        timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'
         
        let posibleCompetenciesPoints   = await rd.getPosibleMeasurementPoints(simQuestionGroupArr, constants.MEASUREMENT_TYPE_KEY.COMPETENCY)
        let stsKeyArr                   = await rd.getStudentToSimKeys( studentKeyArr, simKey)
        let stsKeyArray                 = Object.values(stsKeyArr)

        const studentsRawScore          = await rd.getStudentsRawScore(stsKeyArray, timeZoneInfo)

        
        const measurementKeys    = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simSkillKeyArr           = [...new Set(measurementKeys.map(row => row.FK_skillKey))] 
        const simCompetencyKeyArr      = [...new Set(measurementKeys.map(row => row.FK_competencyKey))]
        const versionLearningGoalKeyArr    = [...new Set(measurementKeys.map(row => row.FK_learningGoalKey))]

        let rawCompetencies             = await rd.getSkillToCompetencyMap(simCompetencyKeyArr,simSkillKeyArr)
        let params = {
            "where":{
                "FK_versionKey": versionKey
            }
        }
        let competencies	    = await rd.getMeasurement(constants.MEASUREMENT_TYPE_KEY.COMPETENCY, params) 
        
        // calc student scores
        studentsRawScore.forEach( rawScore => {
            let overallSkillScore = JSON.parse(rawScore.skills)
            let  overallCompetencyScore = cd.calcCompetencyPercentageScore(JSON.parse(rawScore.competencies), competencies, posibleCompetenciesPoints)
            for (key in overallCompetencyScore) {
                // No skills attached to competency / something failed
                if (rawCompetencies[key] !== undefined) {
                    rawCompetencies[key].score += (overallCompetencyScore[key] / studentsRawScore.length)
                    for (sKey in overallSkillScore) {
                        const skill = rawCompetencies[key].skills[sKey]
                        if (skill !== undefined)
                            rawCompetencies[key].skills[sKey] += ((overallSkillScore[sKey] / studentsRawScore.length) * 100)
                    }
                } else{
                    rawCompetencies[key] = {
                        score: 0,
                        skills: []
                    }
                }
            }            
        })

        return { report: rawCompetencies, examsCompleted: studentsRawScore.length }
    },

    async getAllAttemptsScoreOverviewReport({ simKey, versionKey }) {
        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
        .from(process.env.capstoneDb + 'section as section')
        .innerJoin(process.env.capstoneDb + 'sim as sim','section.sectionkey','sim.sectionkey')
        .where({"simkey":simKey})
        timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'

        const simMeasurementKeys       = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simCompetencyKeyArr      = [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))]

        let competencies                = await db('CapsimInbox').select().from('inbox_competency AS c').whereIn( 'c.competencyKey',simCompetencyKeyArr)

        let posibleCompetenciesScore    = await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.COMPETENCY)
        let possibleSkillPoints         = await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.SKILL)
        

        const studentsInfo = await db('CapsimInbox').select().from('inbox_studentToSim AS sts').innerJoin(process.env.capstoneDb + 'student as cs','sts.FK_studentKey','cs.studentKey').where('sts.FK_simKey', simKey)

        let stsKeyArr = [...new Set(studentsInfo.map(row => row.studentToSimKey))] 

        const rawQuery = process.env.capstoneDb + 'Msiconvertesttolocal_(dateTime, '+timeZoneInfo.worldtimekey+', '+timeZoneInfo.dstpref+', '+timeZoneInfo.timeampm+') AS [localDate]'

        let studentsRawScore = await db('CapsimInbox').select('FK_studentToSimKey','historyKey','skills','competencies','timeSpent','dateTime').select(db('Capstone').raw(rawQuery)).from('inbox_score AS is').whereIn('is.FK_studentToSimKey', stsKeyArr)
        let studentsLog = await db('CapsimInbox').select().from('inbox_studentLog').whereIn('FK_studentToSimKey', stsKeyArr).whereIn('FK_logActionTypeKey',[2,11,12])

        let retVal = []


        let possibleSkillPointSum = cd.sumObjectKeyValues(possibleSkillPoints)

        stsKeyArr.forEach( stsKey => {
            const studentScores  = studentsRawScore.filter(score => score.FK_studentToSimKey == stsKey).sort((a,b)=> a.historyKey < b.historyKey)
            const studentInfo = studentsInfo.find(student => student.studentToSimKey == stsKey)
            let reverseHistoryKey = 0
            studentScores.forEach( score => {
                reverseHistoryKey++
                const studentSkillPointSum = cd.sumObjectKeyValues(JSON.parse( score.skills ))
                const overall = cd.calcPercentage(studentSkillPointSum,possibleSkillPointSum)
                const examTimeLog = studentsLog.find(log => log.FK_studentToSimKey = stsKey && log.historyKey == score.historyKey && log.FK_logActionTypeKey == 12)
                let examTime = (typeof examTimeLog !== 'undefined') ? examTimeLog.value + ' minutes' : ''

                const examCompetenciesLog = studentsLog.find(log => log.FK_studentToSimKey = stsKey && log.historyKey == score.historyKey && log.FK_logActionTypeKey == 11)
                let studentCompetencies = competencies
                if(typeof examCompetenciesLog !== 'undefined' && isJson(examCompetenciesLog.value)){
                    let temp = JSON.parse(examCompetenciesLog.value)
                    studentCompetencies = studentCompetencies.filter( e=> temp.includes(e.competencyKey))
                }

                const  cScore = cd.calcCompetencyPercentageScore(JSON.parse( score.competencies ), studentCompetencies,posibleCompetenciesScore,1)
                const reportObject = {
                    name               : studentInfo.LastName  + ", " + studentInfo.FirstName,
                    overall            : +overall.toFixed(0),
                    timeSpent          : score.timeSpent + ' minutes',
                    completionDate     : moment.utc(score.localDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a'),
                    attempt            : reverseHistoryKey,
                    examTime           : examTime,
                }
                retVal.push(Object.assign(reportObject, {
					competencies: cScore
                }))
            })
        })

        
        return retVal

     },


     async getAllAttemptsConceptMatrixReport({ simKey, versionKey }) {
        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
        .from(process.env.capstoneDb + 'section as section')
        .innerJoin(process.env.capstoneDb + 'sim as sim','section.sectionkey','sim.sectionkey')
        .where({"simkey":simKey})
        timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'


        const simMeasurementKeys       = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
        let skills                      = await db('CapsimInbox').select().from('inbox_skill').whereIn( 'skillKey',simSkillKeyArr)

        let possibleSkillPoints         = await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.SKILL)
        

        const studentsInfo = await db('CapsimInbox').select().from('inbox_studentToSim AS sts').innerJoin(process.env.capstoneDb + 'student as cs','sts.FK_studentKey','cs.studentKey').where('sts.FK_simKey', simKey)

        let stsKeyArr = [...new Set(studentsInfo.map(row => row.studentToSimKey))] 
        const rawQuery = process.env.capstoneDb + 'Msiconvertesttolocal_(dateTime, '+timeZoneInfo.worldtimekey+', '+timeZoneInfo.dstpref+', '+timeZoneInfo.timeampm+') AS [localDate]'

        let studentsRawScore = await db('CapsimInbox').select('FK_studentToSimKey','historyKey','skills','competencies','timeSpent','dateTime').select(db('Capstone').raw(rawQuery)).from('inbox_score').whereIn('FK_studentToSimKey', stsKeyArr)
        let studentsLog = await db('CapsimInbox').select().from('inbox_studentLog').whereIn('FK_studentToSimKey', stsKeyArr).whereIn('FK_logActionTypeKey',[2,11,12])
        let retVal = []


        let possibleSkillPointSum = cd.sumObjectKeyValues(possibleSkillPoints)

        stsKeyArr.forEach( stsKey => {
            const studentScores  = studentsRawScore.filter(score => score.FK_studentToSimKey == stsKey).sort((a,b)=> a.historyKey < b.historyKey)
            const studentInfo = studentsInfo.find(student => student.studentToSimKey == stsKey)
            let reverseHistoryKey = 0
            studentScores.forEach( score => {
                reverseHistoryKey++
                const studentSkillPointSum = cd.sumObjectKeyValues(JSON.parse( score.skills ))
                const overall = cd.calcPercentage(studentSkillPointSum,possibleSkillPointSum)
                const examCompetenciesLog = studentsLog.find(log => log.FK_studentToSimKey = stsKey && log.historyKey == score.historyKey && log.FK_logActionTypeKey == 11)

                let studentSkills = skills
               
                if(typeof examCompetenciesLog !== 'undefined' && isJson(examCompetenciesLog.value)){
                    let competenciesTaken = JSON.parse(examCompetenciesLog.value)
                    let studentMeasurementKeys = simMeasurementKeys.filter(e=> competenciesTaken.includes(e.FK_competencyKey))
                    const studentSkillKeyArr = [...new Set(studentMeasurementKeys.map(row => row.FK_skillKey))] 
                    studentSkills = studentSkills.filter( e=> studentSkillKeyArr.includes(e.skillKey))
                }

                const skillScore = cd.calcSkillPercentageScore(JSON.parse( score.skills ), studentSkills , possibleSkillPoints,1)

                const examTimeLog = studentsLog.find(log => log.FK_studentToSimKey = stsKey && log.historyKey == score.historyKey && log.FK_logActionTypeKey == 12)
                let examTime = (typeof examTimeLog !== 'undefined') ? examTimeLog.value + ' minutes' : ''

                const reportObject = {
                    name               : studentInfo.LastName  + ", " + studentInfo.FirstName,
                    overall            : +overall.toFixed(0),
                    timeSpent          : score.timeSpent + ' minutes',
                    completionDate     : moment.utc(score.localDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a'),
                    attempt            : reverseHistoryKey,
                    examTime           : examTime ,
                }
                retVal.push(Object.assign(reportObject, {skills: skillScore}
            ))
            })
        })

        
        return retVal

     },

     async getSkills({ simKey, versionKey }) {
        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        const simMeasurementKeys       = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
        

        let skills                      = await db('CapsimInbox').select().from('inbox_skill').whereIn( 'skillKey',simSkillKeyArr)
        return skills

    },


})
