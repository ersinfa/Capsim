const db = require('./db.js')
const Version = require('../resources/version')
const Skill = require('../resources/skill')
const moment = require('moment')
const { camelCase } = require('lodash')

RepoertData = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( RepoertData.prototype, {

    getMeasurement(FK_MeasurementTypeKey, params){
        let from = ''
        switch(FK_MeasurementTypeKey) {
            case 1:
                from = 'inbox_skill'
                break;
            case 2:
                from = 'inbox_competency'
                break;
            case 3:
                from = 'inbox_learningGoal'
                break;
        }

        let retVal = db('CapsimInbox').select()
        .from(from)

        if(params.hasOwnProperty("where")){
            retVal = retVal.where(params.where)
        } 
        
        if(params.hasOwnProperty("whereIn")){
            retVal = retVal.whereIn( params.whereIn.column , params.whereIn.values)
        } 

        if(params.hasOwnProperty("skillsObj")){
            retVal = this.arrayToObject(retVal)
        }

        return retVal
    },

    arrayToObject(array){
        return array.reduce( (memo,row) =>{
            memo.skills[row.skillKey] = {}
            memo.skills[row.skillKey].name = row.name
            memo.skills[row.skillKey].description = row.description
            memo.skills[row.skillKey].developmentalTactic = row.developmentalTactic
            return memo;
        }, { skills:{}} )
        .then( data => data.skills)
    },


    getStudentsGoal( stsKeyArray ){
        return db('CapsimInbox')
        .select('sts.FK_studentKey')
        .from('studentGoal AS sg')
        .join('inbox_studentToSim AS sts', 'sg.FK_studentToSimKey', 'sts.studentToSimKey')
        .min('sg.dateTime as dateTime')
        .groupBy('sts.FK_studentKey')
        .whereIn('sts.studentToSimKey', stsKeyArray)
    },
   
    async getStudents( FK_simKey ) {
        const students = await db('CapsimInbox').from('inbox_studentToSim').select('FK_studentKey', 'studentToSimKey').where({ FK_simKey })
        return db('Capstone').from('student').select('studentKey', 'FirstName', 'LastName')
        .whereIn('StudentKey', students.map( student => student.FK_studentKey ))
    },

    getSkillToCompetency( competencyKeyArr, skillKeyArr ){
        return db('CapsimInbox').select([
            'ic.competencyKey',
            'ic.name',
            'ic.developmentalTactic', 
            's.skillKey'
        ]
        )
        .distinct('s.skillKey')
        .from('inbox_answer AS ia')
        .innerJoin('inbox_answerToCompetency AS iatc','ia.answerKey','iatc.FK_answerKey')
        .innerJoin('inbox_competency AS ic','iatc.FK_competencyKey','ic.competencyKey')
        .innerJoin('inbox_answerToSkill AS ats','ats.FK_answerKey','ia.answerKey')
        // Fix, we dont need the skillKey from the skill table, we already have it from answer to skill, remove later. 
        .innerJoin('inbox_skill AS s','ats.FK_skillKey','s.skillKey')
        .whereIn('iatc.FK_competencyKey',competencyKeyArr)
        .whereIn('ats.FK_skillKey',skillKeyArr)
        .orderBy('ic.competencyKey');
    }, 
    // ===================================
    // ========= Self score info =========
    // ===================================
    getStudentsSelfScore( studentkeyList ){
        return db('CapsimInbox').select(
            'sts.FK_studentKey',
            'sts.studentToSimKey',
            'sa.FK_skillKey',
            'sa.points'
        )
        .from('inbox_selfAssessment AS sa')
        .join('inbox_studentToSim AS sts', 'sa.FK_studentToSimKey', 'sts.studentToSimKey')
        .whereIn('sts.studentToSimKey', studentkeyList)
    },

    getWrittenResponses( studentkeyList ){
        return db('CapsimInbox').select(
            'staw.FK_StudentToSimKey',
            'staw.writtenResponse',
            'staw.FK_questionKey',
            'staw.professorGrade',
            'q.descriptionTagKey'
        )
        .from('inbox_studentToAnswerWritten AS staw')
        .join('inbox_question as q', 'q.questionKey', 'staw.FK_questionKey')
        .join('inbox_studentToSim AS sts', 'staw.FK_studentToSimKey', 'sts.studentToSimKey')
        .whereIn('sts.studentToSimKey', studentkeyList)
    },

    getStudentFiles( studentkeyList ){
        return db('CapsimInbox').select(
            'uf.userFileKey',
            'uf.FK_fileTypeKey',
            'uf.FK_fileStatusKey',
            'uf.FK_userTypeKey',
            'uf.fileName',
            'uf.professorComments',
            'uf.fileUploadDate',
            'uf.displayName',
            'uf.grade',
            'uftf.FK_studentToSimKey',
            'fs.description as status',
            'fs.fileStatusKey',
            'uf.grade',
            'uf.FK_cycleKey'
        )
        .from('inbox_userFile AS uf')
        .join('inbox_userFileToUser as uftf', 'uftf.FK_userFileKey', 'uf.userFileKey')
        .join('inbox_fileStatus as fs', 'uf.FK_fileStatusKey', 'fs.fileStatusKey')
        .whereIn('uftf.FK_studentToSimKey', studentkeyList)
    },

    getStudentWrittenResponses(stsKey){
        return db('CapsimInbox').select(
            'staw.FK_StudentToSimKey',
            'staw.writtenResponse',
            'staw.FK_questionKey',
            'staw.professorGrade',
            'q.descriptionTagKey'
        )
        .from('inbox_studentToAnswerWritten AS staw')
        .join('inbox_question as q', 'q.questionKey', 'staw.FK_questionKey')
        .join('inbox_studentToSim AS sts', 'staw.FK_studentToSimKey', 'sts.studentToSimKey')
        .whereIn('sts.studentToSimKey', stsKey)
    },

    getStudentSelfScoreObj( FK_studentToSimKey ){
        return db('CapsimInbox').select(
            'sts.FK_studentKey',
            'sts.studentToSimKey',
            'sa.FK_skillKey',
            'sa.points'
        )
        .from('inbox_selfAssessment AS sa')
        .join('inbox_studentToSim AS sts', 'sa.FK_studentToSimKey', 'sts.studentToSimKey')
        .where('sa.FK_studentToSimKey', FK_studentToSimKey)
        .reduce( (memo,row) => {
            memo.skillScore[row.FK_skillKey] = row.points
            return memo;
        }, { skillScore:{}} )
        .then( data => data.skillScore )
    },

    // ==============================
    // ========= Score info professor =========
    // ==============================
    getStudentsRawScore( stsKeyArr, timeZoneInfo ){
        const rawQuery = process.env.capstoneDb + 'Msiconvertesttolocal_([is].dateTime, '+timeZoneInfo.worldtimekey+', '+timeZoneInfo.dstpref+', '+timeZoneInfo.timeampm+') AS [localDate]'

        return db('CapsimInbox')
        .select('sts.FK_studentKey', 'sts.studentToSimKey', 'is.overall', 'is.skillSum', 'is.skills', 'is.dateTime', 'is.competencies', 'is.timeSpent', 'is.FK_studentToSimKey', 'is.learningGoals')
        .select(db('Capstone').raw(rawQuery))
        .from('inbox_score AS is')
        .join('inbox_studentToSim AS sts', 'is.FK_studentToSimKey', 'sts.studentToSimKey')
        .whereIn('sts.studentToSimKey', stsKeyArr)
        .andWhere({'is.historyKey':0})
    },

    // ======================================
    // ========= Score info student =========
    // ======================================

    async getStudentToSimKeys(studentkeyArr, simKey){
        const keys = await db('CapsimInbox').select(
            'sts.FK_studentKey as studentKey',
            'sts.studentToSimKey as stsKey'
        )
        .from('inbox_studentToSim AS sts')
        .whereIn('sts.FK_studentKey', studentkeyArr)
        .where('sts.FK_simKey', simKey)
        
        const map = {}
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index].studentKey
            const value = keys[index].stsKey
            map[key] = value
        }
        return map
    },
   
    async getSkillToCompetencyMap(competencyKeyArr, skillKeyArr){
        const rawCompetencies = await this.getSkillToCompetency( competencyKeyArr, skillKeyArr )
        let linkedCompetencies = rawCompetencies.reduce((newObject, competency) => {
            if (!newObject[competency.name]) {
                newObject[competency.name] = {
                    score: 0,
                    skills : new Array()
                }
            }
            newObject[competency.name].skills.push(competency.skillKey[0])
            return newObject
        }, {})
        for(key in linkedCompetencies) {
            linkedCompetencies[key].skills= linkedCompetencies[key].skills.reduce((skill, key) => {
                skill[key] = 0
                return skill
            }, {})
        }  
        return linkedCompetencies
    }, 

    async getScoreAll( FK_versionKey ) {

        const version = await Version.where({ versionKey: FK_versionKey }).fetch()
        const combineVersions = version.get('combineScoringJson')
        const skillsMap = await this.mapCombinedSkills(combineVersions, FK_versionKey)

        return db('CapsimInbox').select(
            'overall',
            'skillSum',
            'skills'
        )
        .from('inbox_score')
        // .whereRaw('timeSpent BETWEEN ? AND ?', [5, 200])
        .whereIn('FK_versionKey', [...combineVersions, FK_versionKey])
        .andWhere({'historyKey':0})
        .reduce( (memo,row) => {

            memo.overall.push(row.overall)
            memo.skillSum.push(row.skillSum)

            const origSkills = JSON.parse(row.skills)
            const tempSkills = {}
            Object.keys(origSkills).forEach( key => tempSkills[skillsMap[key]] = origSkills[key])

            for (var key in tempSkills) {
                if( typeof memo.skills[skillsMap[key]] == 'undefined'){
                    memo.skills[skillsMap[key]] = []
                }
                memo.skills[skillsMap[key]].push(tempSkills[skillsMap[key]]);
            }

            return memo;
        }, { overall:[], skillSum:[], skills:{}, competencies: {} })
    },

    async getSkillPointSum( FK_versionKey ) {
        const [points] = await db('CapsimInbox')
        .sum('points as skillPoints')
        .from('inbox_answerToSkill as ats')
        .join('inbox_answer as ia', 'ia.answerKey', 'ats.FK_answerKey')
        .join('inbox_questionToVersion as qtv', 'qtv.FK_questionKey ', 'ia.FK_questionKey')
        .whereIn('qtv.FK_versionKey',FK_versionKey) 
        const {skillPoints} = points  
        return skillPoints
    },

    getExamSkillScore(rawSkillScore, skillPoints) {
        const examSkills = {}
        for (let key in rawSkillScore) {
            examSkills[key] = ((rawSkillScore[key]/ skillPoints) * 100)
        }
        return examSkills
    },

    async mapCombinedSkills(combineScoring, versionKey) {
        const allSkills = await db('CapsimInbox').select('skillKey', 'name', 'FK_versionKey').from('inbox_skill').whereIn('FK_versionKey',versionKey)
        const original = allSkills.filter( skill => skill.FK_versionKey === versionKey )

        const mappedSkills = allSkills.reduce((retObj, skill) => {
            const { skillKey } = original.find( oSkill => oSkill.name === skill.name )
            retObj[skill.skillKey] = skillKey
            return retObj
        }, {})

        return mappedSkills
    },

    async getPosibleMeasurementPoints(questionGroupKeyArr,FK_MeasurementTypeKey) {

        let from = ''
        let measurementKey = ''
        switch(FK_MeasurementTypeKey) {
            case 1:
                from = 'inbox_answerToSkill'
                measurementKey = 'FK_skillKey'
                break;
            case 2:
                from = 'inbox_answerToCompetency'
                measurementKey = 'FK_competencyKey'
                break;
            case 3:
                from = 'inbox_answerToLearningGoal'
                measurementKey = 'FK_learningGoalKey'
                break;
        }

        let retVal = {}

        let measurementPoints = await db('CapsimInbox').select([
            'q.questionKey',
            'measurement.points',
            'measurement.'+measurementKey
        ])
        .from('inbox_answer AS a')
        .innerJoin(from +' AS measurement','a.answerKey','measurement.FK_answerKey')
        .innerJoin('inbox_question AS q','q.questionKey','a.FK_questionKey')
        .whereIn( 'q.FK_questionGroupKey', questionGroupKeyArr )

        let questions= await db('CapsimInbox').select()
        .from('inbox_question')
        .whereIn( 'FK_questionGroupKey', questionGroupKeyArr )

         // Grabs first question from question group
         questions = questions.filter((question, index, self) =>
            index === self.findIndex((t) => (
                t.FK_questionGroupKey === question.FK_questionGroupKey
            ))
        )
        

        questions.forEach( item =>{
            let questionAnswers = measurementPoints.filter( subItem => subItem.questionKey === item.questionKey)
            
            let temp = {}
            
            // Gets question posible top point per competency 
            questionAnswers.forEach( subItem =>{
                if(temp.hasOwnProperty(subItem[measurementKey])){
                    // Checks if single or multi answer question
                    if(item.FK_questionTypeKey == 1){ //Single answer question
                        if(temp[subItem[measurementKey]] < subItem.points) temp[subItem[measurementKey]] = subItem.points
                    }else{ // Multi answer question
                        if(subItem.points>0) temp[subItem[measurementKey]] += subItem.points
                    }
                }else{
                    temp[subItem[measurementKey]] = subItem.points
                }
            })

            // Sums posible compentecy points per quiz 
            for (let key in temp) {
                if(retVal.hasOwnProperty(key)){
                    retVal[key] += temp[key]
                }else{
                    retVal[key] = temp[key]
                }
            }
        })
        
        return retVal
    },



    async getCompetencyPercentageScore(competenciesScore, examQuestionGroupsArray, competencyKeyArr) {
        let posibleCompetenciesScore = await this.getPosibleMeasurementPoints(examQuestionGroupsArray,2)
        let competencies= await db('CapsimInbox').select()
        .from('inbox_competency AS c')
        .whereIn( 'c.competencyKey',competencyKeyArr)

        retVal={}
        competencies.forEach(item =>{
            retVal[item.name] = (posibleCompetenciesScore[item.competencyKey] > 0 ) ? ((competenciesScore[item.name] / posibleCompetenciesScore[item.competencyKey])*100) : ((competenciesScore[item.name] / 1)*100)
        })
        return retVal

    },

    async getCompetencyPercentageScoreByKey(competenciesScore, examQuestionGroupsArray, competencyKeyArr) {
        let posibleCompetenciesScore = await this.getPosibleMeasurementPoints(examQuestionGroupsArray,2)
        let competencies= await db('CapsimInbox').select()
        .from('inbox_competency AS c')
        .whereIn( 'c.competencyKey',competencyKeyArr)

        retVal={}
        competencies.forEach(item =>{
            retVal[item.competencyKey] = (posibleCompetenciesScore[item.competencyKey] > 0 ) ? ((competenciesScore[item.name] / posibleCompetenciesScore[item.competencyKey])*100) : ((competenciesScore[item.name] / 1)*100)
        })
        return retVal

    },
    
    // Return an Array of learning goal scores
    getLearningGoalPercentageScore (learningGoalsScore, learningGoals, posibleLearningGoalsScore) {
        try {
            return learningGoals.map(item => {
                const key = camelCase(item.name)
                const name = item.name
                let score = {}
                if(!learningGoalsScore) {
                    score = '-'
                }else{
                    const rawScore = JSON.parse(learningGoalsScore)
                    if (posibleLearningGoalsScore[item.learningGoalKey] > 0 ){
                        score = ((rawScore[item.name] / posibleLearningGoalsScore[item.learningGoalKey]) * 100)
                    } else {
                        score = ((rawScore[item.name] / 1) * 100)
                    }
                }
                return { key, name, score }
            })
        } catch (error) {
            console.log(error)
            return []
        }
    },

    // Return an Array of saved student learning goal points
    getStudentsLearningGoal( stsKeyArr ){
        return db('CapsimInbox')
            .select('sts.FK_studentKey','is.learningGoals', 'cs.FirstName', 'cs.LastName')
            .from('inbox_score AS is')
            .join('inbox_studentToSim AS sts', 'is.FK_studentToSimKey', 'sts.studentToSimKey')
            .join(process.env.capstoneDb + 'student as cs','sts.FK_studentKey','cs.studentKey')
            .whereIn('sts.studentToSimKey', stsKeyArr)
            .andWhere({'is.historyKey':0})
    },



    getSkillPercentageScore(skillsScore, skills, possibleSkillScore) {
        retVal={}
        skills.forEach(item =>{
            retVal[item.get('skillKey')] = (possibleSkillScore[item.get('skillKey')] > 0 )? (skillsScore[item.get('skillKey')] / possibleSkillScore[item.get('skillKey')])*100: (skillsScore[item.get('skillKey')] / 1)*100
        })

        return retVal
    },

    getExamQuestionGroupsArray( stsKey ) {
        return db('CapsimInbox')
            .select('FK_questionGroupKey')
            .from('inbox_questionGroupToSim AS qgts')
            .innerJoin('inbox_studentToSim AS sts', 'sts.FK_simKey', 'qgts.FK_simKey')
            .where('sts.studentToSimKey' , stsKey)
            .map(row => row.FK_questionGroupKey)
    },

    getExamQuestionGroupsArrayBySimkey( simKey ) {
        return db('CapsimInbox')
            .select('FK_questionGroupKey')
            .from('inbox_questionGroupToSim')
            .where('FK_simKey' , simKey)
            .map(row => row.FK_questionGroupKey)
    },

    getMeasurementKeysFromQuestionGroups( questionGroupArray ) {
        return db('CapsimInbox')
            .select('ats.FK_skillKey','atc.FK_competencyKey','atlg.FK_learningGoalKey')
            .from('inbox_question AS q')
            .leftJoin('inbox_answer AS a', 'a.FK_questionKey', 'q.questionKey')
            .leftJoin('inbox_answerToSkill AS ats', 'ats.FK_answerKey', 'a.answerKey')
            .leftJoin('inbox_answerToCompetency AS atc', 'atc.FK_answerKey', 'a.answerKey')
            .leftJoin('inbox_answertolearninggoal AS atlg', 'atlg.FK_answerKey', 'a.answerKey')
            .whereIn('q.FK_questionGroupKey', questionGroupArray)
    },

    async getConstructs(stsKey){
		const zScoreValues = await db('Capstone')
		.select()
		.from('ZScoreProb')
		let answers = await db('CapsimInbox')
		.select('pa.answer', 'pq.questionKey', 'pc.name', 'pc.constructKey', 'pc.zScoreFactor1', 'pc.zScoreFactor2', 'pc.description')
		.from('postAssessment_answer AS pa')
		.join('postAssessment_question AS pq', 'pq.questionKey', 'pa.FK_questionKey')
		.join('postAssessment_construct AS pc', 'pc.constructKey', 'pq.FK_constructKey')
        .whereIn( 'pa.FK_studentToSimKey',stsKey)       

		let answerArr = []
		let answerObj = answers.reduce((obj, e)=>{
			if(!obj.hasOwnProperty(e.constructKey)){
				obj[e.constructKey] = {
                    numberOfQuestions: 0,
                    totalScore: 0,
                    zScoreFactor1: e.zScoreFactor1,
                    zScoreFactor2: e.zScoreFactor2,
                    description: e.description,
                    constructName: e.name,
                    constructKey: e.constructKey
                }
            }
            obj[e.constructKey].numberOfQuestions = obj[e.constructKey].numberOfQuestions + 1
            obj[e.constructKey].totalScore = obj[e.constructKey].totalScore + e.answer
            return obj
        }, {})
            for(let c in answerObj){
                //do this for the 3 constructs but not for aggregate keys
                if(answerObj[c]){
                    answerObj[c].averageScore =  answerObj[c].totalScore / answerObj[c].numberOfQuestions
                    answerObj[c].zScore = Math.round( ((answerObj[c].averageScore - answerObj[c].zScoreFactor1 ) / answerObj[c].zScoreFactor2) * 100) / 100
                    zScoreValues.map((z, i) =>{
                        if((i == 0 && answerObj[c].zScore <= z.ZScoreKey) || (i == 98 && answerObj[c].zScore >= z.ZScoreKey) || (answerObj[c].zScore > z.ZScoreKey && answerObj[c].zScore <= zScoreValues[i+1].ZScoreKey )) {
                            answerObj[c].zScoreProbability = z.ZScoreProbability
                            answerArr.push(answerObj[c]) 
                        } 
                    })
                }
            }
		return answerArr
    },
    
    getLevels(){
        return db('CapsimInbox')
		.select('l.levelKey', 'l.name', 'ld.FK_constructKey', 'ld.description')
		.from('postAssessment_level AS l')
        .join('postAssessment_levelDescription AS ld', 'ld.FK_levelKey', 'l.levelKey')
    }

})
