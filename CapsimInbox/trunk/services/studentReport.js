const db = require('./db.js')
const Skill = require('../resources/skill')
const cd = require('./calcData.js')
const rd = require('./reportData.js')
const constants = require('./constants')
const Version = require('../resources/version')

StudentReport = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( StudentReport.prototype, {


    /**
    * Provides data needed for student report page
    *
    * @param {Number} [studentToSimKey]
    *
    * @returns {Object}
    */
    async buildReport( studentToSimKey, versionKey ) {
        let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
        .from(process.env.capstoneDb + 'section as section')
        .innerJoin(process.env.capstoneDb + 'sim as sim','section.sectionkey','sim.sectionkey')
        .innerJoin(process.env.capsimInboxDb + 'inbox_studentToSim as sts','sts.FK_simKey','sim.simkey')
        .where({"sts.studentToSimKey":studentToSimKey})
        timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'
        const score = await rd.getStudentsRawScore( studentToSimKey, timeZoneInfo )
        if( !score[0] ) return

        // versionKey passed to this functions was not correct, getting correct versionKey to avoid future bugs
        let getVersionKey = await db('CapsimInbox').first('vts.versionKey').from('inbox_versionToSim AS vts').join('inbox_studentToSim AS sts', 'sts.FK_simKey', 'vts.simKey').where({ 'sts.studentToSimKey': studentToSimKey })
        versionKey = getVersionKey.versionKey

        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArray(studentToSimKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        const simMeasurementKeys           = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
        const simCompetencyKeyArr      = [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))]
        const simLearningGoalKeyArr    = [...new Set(simMeasurementKeys.map(row => row.FK_learningGoalKey))]
        
        const scoreAll = await rd.getScoreAll( versionKey )
        const selfSkillScore = await rd.getStudentSelfScoreObj( studentToSimKey )
        const writtenResponse    = await rd.getStudentWrittenResponses( studentToSimKey )
        const pSkillScore = cd.skillScore(JSON.parse(score[0].skills), scoreAll.skills)
        let {nSkills} = await db('CapsimInbox').table('inbox_skill').where({ FK_versionKey:versionKey }).count('skillKey AS nSkills').first()
        const devIndexScore = await cd.developmentIndex( pSkillScore, versionKey, nSkills )
        const version = await Version.where({ versionKey }).fetch()
        const constructs = await rd.getConstructs(studentToSimKey)
        const levels = await rd.getLevels()
        let percentile = null
        let overall = null
        let skillGap = null 
        let competenciesScore = null
        let keyIndexesScores = await this.getKeyIndexesReport(score[0].competencies)
        // Fix Later, version check changes how the score and messages are calculated  
        if(version.get('isExam') == 1 ){
            const possibleSkillPoints =  await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.SKILL)
            let possibleSkillPointSum = cd.sumObjectKeyValues(possibleSkillPoints)
            let overallScore = cd.calcPercentage(score[0].skillSum,possibleSkillPointSum)
            const message = `Your overall percentage was ${overallScore.toFixed(0)}. This overall score is based on how many points you were awarded during the exam. `; 
            overall = this.getOverallReport( overallScore,  message)
            const skills    =  await Skill.where('skillKey','in', simSkillKeyArr ).fetchAll()
            let examSkills  = await rd.getSkillPercentageScore(JSON.parse(score[0].skills), skills, possibleSkillPoints)
            skillGap = await this.getSkillGapReport( examSkills, selfSkillScore, simSkillKeyArr )
        }else{
            percentile = +cd.calcPercentile( score[0].overall, scoreAll.overall )
            overall = this.getOverallReport( percentile )
            skillGap = await this.getSkillGapReport( pSkillScore, selfSkillScore, simSkillKeyArr )

        }
        competenciesScore = (score[0].competencies) ? await rd.getCompetencyPercentageScore(JSON.parse(score[0].competencies),simQuestionGroupArr,simCompetencyKeyArr) : {}
        const retVal = {
            overall: overall,
            selfAwareness: this.getSelfAwarenessReport( cd.selfAwarenessScore( pSkillScore, selfSkillScore ) ),
            skillGap: skillGap,
            devIndex: this.getDevelopmentIndexlReport( devIndexScore ),
            competencies: competenciesScore,
            reportComponents: version.get('reportComponentsJson'),
            writtenResponse: this.writtenResponseScore(writtenResponse),
            studentToSimKey,
            constructs, 
            levels,
            keyIndexesScores
        }
        return retVal
    },
    async getCompetencyScore( studentToSimKey ) {
        let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
        .from(process.env.capstoneDb + 'section as section')
        .innerJoin(process.env.capstoneDb + 'sim as sim','section.sectionkey','sim.sectionkey')
        .innerJoin(process.env.capsimInboxDb + 'inbox_studentToSim as sts','sts.FK_simKey','sim.simkey')
        .where({"sts.studentToSimKey":studentToSimKey})
        timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'

        const score = await rd.getStudentsRawScore( studentToSimKey, timeZoneInfo )
        if( !score[0] ) return
        let getVersionKey = await db('CapsimInbox').first('vts.versionKey').from('inbox_versionToSim AS vts').join('inbox_studentToSim AS sts', 'sts.FK_simKey', 'vts.simKey').where({ 'sts.studentToSimKey': studentToSimKey })
        let versionKey = getVersionKey.versionKey

        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArray(studentToSimKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        const simMeasurementKeys           = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
        const simCompetencyKeyArr      = [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))]
        const simLearningGoalKeyArr    = [...new Set(simMeasurementKeys.map(row => row.FK_learningGoalKey))]

        let competenciesScore = null

        competenciesScore = (score[0].competencies) ? await rd.getCompetencyPercentageScoreByKey(JSON.parse(score[0].competencies),simQuestionGroupArr,simCompetencyKeyArr) : {}
        return competenciesScore
    },
	getOrdinal(n) {
		const s = ["th","st","nd","rd"]
		const v = n % 100
		return n+(s[(v-20)%10]||s[v]||s[0])
	},


    /**
    * Provides data needed for student report page overall section
    *
    * @param {Number} [score]
    *
    * @returns {Object}
    */
    getOverallReport( score, message = null ) {
        score = score.toFixed(0)
        // Fix later, different versions require new logic. Its not looking pretty
        if(message == null){
            message = `Your overall performance was ${this.getOrdinal(score)} percentile. This overall score is based on how accurately you responded to the emails and messages during the exercise. The score is a percentile, which shows your overall performance relative to the CapsimInbox database. A score of ${this.getOrdinal(score)} percentile means that you performed higher than ${this.getOrdinal(score)} of the individuals in the database.`
        }
        return {
            score,
            message: message
        }
    },

    /**
    * Provides data needed for student report page development index section
    *
    * @param {Object} { score1, score2, label1, label2 } this type of object is being returned from cd.developmentIndex()
    *
    * @returns {Object}
    */
    getDevelopmentIndexlReport( { score1, score2, label1, label2 } ){
        let chartData = [];
        let yLength = constants.DEVELOPMENT_INDEX.LABELS_1.length;
        let xLength = constants.DEVELOPMENT_INDEX.LABELS_2.length;;
        for (let x = 0; x < xLength; x++ ){
            for (let y = 0; y < yLength; y++ ){
                if( x == score2 && y == score1){
                    chartData.push([x,y,1]);
                }else{
                    chartData.push([x,y,0]);
                }
            }
        }

        let retVal = {
            chart: {
                data:chartData
                ,yCategories:constants.DEVELOPMENT_INDEX.LABELS_1
                ,xCategories:constants.DEVELOPMENT_INDEX.LABELS_2
            }
            ,message : `Your development index shows your current level of skill proficiency is at the ${label1} level. Across the five skills, you ${label2} demonstrated this ${label1} level of proficiency. Your ultimate goal for professional development is to consistently demonstrate an advanced level across all five skills.`
        }
        return retVal
    },


    /**
    * Provides data needed for student report page skill gap section
    *
    * @param {Object} [pSkillScore]
    * @param {Object} [selfSkillScore]
    *
    * @returns {Object}
    */
    getSkillGapReport(  pSkillScore, selfSkillScore, skillKeyArr ){
       
        return new Promise( ( resolve, reject ) => {
            let params = {
                "whereIn":{
                    "column": "skillKey",
                    "values": skillKeyArr
                },
            }
            rd.getMeasurement(  constants.MEASUREMENT_TYPE_KEY.SKILL, params )
            .then( skillsInfo => {
                let retVal = {}
                skillsInfo.forEach( skill => {
                    retVal[skill.skillKey] = {
                        name: skill.name,
                        description: skill.description,
                        selfScore: (typeof selfSkillScore[skill.skillKey] == 'undefined')? 0 : selfSkillScore[skill.skillKey].toFixed(0),
                        gameScore: pSkillScore[skill.skillKey].toFixed(0),
                        skillKey: skill.skillKey
                    }
                })
                resolve(retVal)
            })
            .catch( err => reject( err ) )
        })
    },

    /**
    * Provides data needed for student report page self awareness section
    *
    * @param {Object} {selfAwarenessScore, matchCount, underRatedCount, overRatedCount} this type of object is being returned from cd.selfAwarenessScore()
    *
    * @returns {Object}
    */
    getSelfAwarenessReport( {selfAwarenessScore, matchCount, underRatedCount, overRatedCount} ){

        let label1 = selfAwarenessScore
        let label2 = constants.SELF_AWARESNESS.LABELS[matchCount]
        let label3 = "";

        if( underRatedCount < overRatedCount ){
            // Overrated
            label3 = "When you are inaccurate, it is due to over-rating yourself";
        }else if(underRatedCount > overRatedCount){
            // Underrated
            label3 = "When you are inaccurate, it is due to under-rating yourself.";
        }else if(underRatedCount == overRatedCount && underRatedCount  != 0 ){
            // Overrated and Underrated
            label3 = "When you are inaccurate, it is due to both over- and under-rating yourself.";
        }

        let retVal = {
            message: `Your self-awareness index is a ${label1}. This score reflects how accurately your self-assessments match the objective assessments produced by CapsimInbox. Higher scores equate to more accurate self-awareness. Your score indicates that you are currently ${label2} in self-awareness accuracy. ${label3} It is important to recognize that an accurate understanding of your skills is the essential first step to improving these skills.`
            ,score: selfAwarenessScore
        }

        return retVal
    },

    /**
    * Provides data needed for student report page written response section
    *
    * @param {Object} {FK_StudentTosimKey, FK_questionKey, descriptionTagKey, professorGrade, writtenResponse}
    *
    * @returns {Object}
    */

    writtenResponseScore(writtenResponses){
        let grades = {
            numberOfQuestions: writtenResponses.length,
            numberOfGrades: 0,
            average: 0,
            questionGrades: {}
        }
         
        writtenResponses.forEach(res=>{
            if(res.professorGrade) {
                grades.questionGrades[res.FK_questionKey] = res.professorGrade
                grades.numberOfGrades = grades.numberOfGrades + 1
            }    
            //calculates average if all test scores are graded 
            if(grades.numberOfGrades == grades.numberOfQuestions){
                let sum = 0
                for(let q in grades.questionGrades){
                    sum += grades.questionGrades[q]
                }
                grades.average = Math.floor(sum / grades.numberOfGrades)
            }
        })

        let retVal = {
            message: `This score is representative of your score for the written responses submitted during the CapsimInbox assessment. The grade was based on how well you answered each stimuli and determined by your professor.`
            ,score: grades.average
        }
        return retVal
    },

    async getKeyIndexesReport(competenciesJson){
        let competencies = JSON.parse(competenciesJson)
        procrastinationPercentile = 0
        if(Object.keys(competencies).length > 0 ){
            let allTimeManagementStudents = await db('CapsimInbox').select('studentToSimKey', 'competencies').from('inbox_studentToSim AS sts').join('inbox_versionToSim AS vts', 'sts.FK_simKey', 'vts.simKey').join('inbox_score AS is', 'is.FK_studentToSimKey', 'sts.studentToSimKey').where('versionKey' , 223)
            let prioritizationScores = []
            let procrastinationScores = []
            allTimeManagementStudents.map((s) => {
                let comp = JSON.parse(s.competencies)
                if(Object.keys(comp).length > 0){
                    prioritizationScores.push(comp.Prioritization)
                    procrastinationScores.push(comp.Procrastination)
                }
            })
            prioritizationScores.sort((a, b)=> b - a )
            procrastinationScores.sort((a, b)=> a - b )
            prioritizationIndex = 0
            procrastinationIndex = 0
            prioritizationScores.map((p, idx, arr) => {
                if(competencies.Prioritization == arr[idx+1]) prioritizationIndex = idx
            })

            procrastinationScores.map((p, idx, arr) => {
                if(competencies.Procrastination == arr[idx != 0 ? idx-1 : idx]) procrastinationIndex = idx
            })
            
            if(competencies.Prioritization == 0) competencies.PrioritizationPercentile = 1
            else if(competencies.Prioritization == 7) competencies.PrioritizationPercentile = 99
            else competencies.PrioritizationPercentile = Math.round(((prioritizationIndex + 1) / (prioritizationScores.length + 1)) * 100)
            
            if(competencies.Procrastination == 0) competencies.ProcrastinationPercentile = 99
            else if(competencies.Procrastination == 7) competencies.ProcrastinationPercentile = 1
            else competencies.ProcrastinationPercentile = Math.round(((procrastinationIndex + 1) / (procrastinationScores.length + 1)) * 100)
        
        }
        return competencies
    }



})
