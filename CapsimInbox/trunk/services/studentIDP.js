var db = require('./db.js');
const Skill = require('../resources/skill')
var cd = require('./calcData.js');
var rd = require('./reportData.js');
const constants = require('./constants')

StudentIDP = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( StudentIDP.prototype, {

    async buildIDP( studentToSimKey, versionKey, isExam ){
        let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArray(studentToSimKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)

        const simMeasurementKeys    = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
        const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
        const simCompetencyKeyArr      = [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))]
        const simLearningGoalKeyArr    = [...new Set(simMeasurementKeys.map(row => row.FK_learningGoalKey))]
        let timeZoneInfo = await db('capstone').first('section.worldtimekey','section.timeampm','section.dstpref')
        .from(process.env.capstoneDb + 'section as section')
        .innerJoin(process.env.capstoneDb + 'sim as sim','section.sectionkey','sim.sectionkey')
        .innerJoin(process.env.capsimInboxDb + 'inbox_studentToSim as sts','sts.FK_simKey','sim.simkey')
        .where({"sts.studentToSimKey":studentToSimKey})
        timeZoneInfo.timeampm = (timeZoneInfo.timeampm)? '1':'0'

        let rawSkillScoreAll    = await rd.getScoreAll( versionKey )
        let rawSkillScore       = await rd.getStudentsRawScore( studentToSimKey, timeZoneInfo ).then( score => JSON.parse(score[0].skills) )
        let pSkillScore         = cd.skillScore( rawSkillScore, rawSkillScoreAll.skills )
        let params = {
            "whereIn":{
                "column": "skillKey",
                "values": simSkillKeyArr
             },
             "skillsObj":true
        }
        let skills              = await rd.getMeasurement( constants.MEASUREMENT_TYPE_KEY.SKILL, params )
        let ret = null; 
        // If Exam, append skills to Competencies
        // Also do exam calculations for skills, they are different than inbox
        if(isExam == 1){
            const possiblePoints    = await rd.getPosibleMeasurementPoints(simQuestionGroupArr,constants.MEASUREMENT_TYPE_KEY.SKILL)
            const skillsBookShelf   = await Skill.where('skillKey','in', simSkillKeyArr ).fetchAll()
            const examSkills        = await rd.getSkillPercentageScore(rawSkillScore, skillsBookShelf, possiblePoints)
            const rawCompetencies    = await rd.getSkillToCompetency( simCompetencyKeyArr, simSkillKeyArr )
            ret = this.mapSkillScore(examSkills, skills);
            ret = this.linkSkills(rawCompetencies, ret)
            const score = await rd.getStudentsRawScore( studentToSimKey, timeZoneInfo )
            let competenciesScore = (score[0].competencies) ? await rd.getCompetencyPercentageScore(JSON.parse(score[0].competencies),simQuestionGroupArr,simCompetencyKeyArr) : {}
            for(let i = 0; i<ret.length; i++){
                ret[i].score = competenciesScore[ret[i].competencyName]
            }
            
        }else{
            ret = this.mapSkillScore(pSkillScore, skills); 
        }
        return ret
    },

    mapSkillScore(skillScore, skills){
        let temp = []
        for (let key in skillScore) {
            temp.push({
                score: skillScore[key].toFixed(0)
                ,name: skills[key].name
                ,description: skills[key].description
                ,skillKey: key
                ,devTactic: skills[key].developmentalTactic
                ,needDev: this.devNeedLevel(skillScore[key])
            })
        }
        temp.sort(function(a, b) {
            return a.score - b.score;
        });
        return temp
    },


    linkSkills(competencies, skills){
        // convert skills to map
        const skillMap = {}; 
        skills.forEach(x => {
            skillMap[x.skillKey] = x
        })
        // map skill to competency
        const linkedCompetencies = competencies.map(competency => {
            competency.skillKey = competency.skillKey[0]
            competency.skill = skillMap[competency.skillKey]
            return competency
        })
        // convert competencies to map
        const competencyMap = {}
        linkedCompetencies.forEach((x, index) => {
            if(competencyMap[x.name]){
                competencyMap[x.name].skills.push(x.skill)
            }else{
                competencyMap[x.name] = {
                    competencyKey:x.competencyKey, 
                    competencyName:x.name, 
                    developmentalTactic:x.developmentalTactic,
                    skills : new Array()
                }
                competencyMap[x.name].skills.push(x.skill)
            } 
        })
        // Update: Skill.vue is expecting an array, so convert to array instead 
        return Object.values(competencyMap)
    }, 


    devNeedLevel( score ){
        let retVal = ""
         if (score > 70) {
                retVal = "Low";
            }else if(score <= 30){
                retVal = "High";
            }else{
                retVal = "Medium";
            }

        return retVal
    },

    getStudentGoals( FK_studentToSimKey ){
        return db('CapsimInbox').select(
            'studentGoalKey',
            'goal',
            'dateTime'
        )
        .from('studentGoal')
        .where({ FK_studentToSimKey })
    },

    getStudentGoal( studentGoalKey ){
        return db('CapsimInbox').first(
            'studentGoalKey',
            'goal',
            'dateTime',
            'FK_studentToSimKey'
        )
        .from('studentGoal')
        .where('studentGoalKey', studentGoalKey)
    },

    setStudentGoal( FK_studentToSimKey, goal ){
        return db('CapsimInbox')
        .insert({ FK_studentToSimKey, goal })
        .into('studentGoal')
        .returning('studentGoalKey')
    },

    updateStudentGoal( FK_studentToSimKey, studentGoalKey, goal ) {
        return db('CapsimInbox').table('studentGoal').where({ FK_studentToSimKey, studentGoalKey }).update({ goal, dateTime: new Date() })
    }
})
