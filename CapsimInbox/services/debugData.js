var db = require('./db.js')
var gs = require('./gameScore')
var gd = require('./gameData')
const CONSTANTS = require('./constants')
const Skill = require('../resources/skill')


DebugData = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( DebugData.prototype, {

    async buildLogAll(){
        let answerSkills        = await this.getAnswerSkills()
        let answers             = await this.getQuestionsAndAnswers()
        let questions           = await this.getQuestions()
        let files               = await this.getFiles()
        let scoreAll            = await this.getInboxScoreAll()
        let studentToSimKeyArr  = scoreAll.map( row => row.FK_studentToSimKey )
        let logAll              = await this.getLog( studentToSimKeyArr )
        let startGameLogAll     = logAll.filter( log => log.FK_logActionTypeKey == 1 )

        let studentsList = {}
        scoreAll.forEach( student => {
            studentsList[student.FK_studentKey] = student
        })
        startGameLogAll.forEach( student => {
            studentsList[student.FK_studentKey].dateTimeStart = student.dateTime
        })

        let submitAnswerLogAll  = logAll.filter( log => log.FK_logActionTypeKey == 3 )
        let openMessageLogAll   = logAll.filter( log => log.FK_logActionTypeKey == 4 )
        let openEmailLogAll     = logAll.filter( log => log.FK_logActionTypeKey == 5 )
        let openFileLogAll      = logAll.filter( log => log.FK_logActionTypeKey == 6 )
        let clickImportantLogAll = logAll.filter( log => log.FK_logActionTypeKey == 7 )

        let retVal = {
            submitAnswer        : this.formatSubmitAnswerLogAll( submitAnswerLogAll, studentsList, answers, answerSkills )
            ,openMessage        : this.formatOpenMessageLogAll( openMessageLogAll, studentsList, questions )
            ,openEmail          : this.formatOpenEmailLogAll( openEmailLogAll, studentsList, questions )
            ,openFile           : this.formatOpenFileLogAll( openFileLogAll, studentsList, files )
            ,clickImportant     : this.formatClickImportantLogAll( clickImportantLogAll, studentsList, questions )
            ,selfAssessment     : await this.getSelfAssessment()
        }

        return retVal
    },

    formatTime( time ){
        let minutes = Math.floor(time / (60*1000) );
        let seconds = ((time % (60*1000)) / 1000).toFixed(0);
        return " " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds
    },

    formatSubmitAnswerLogAll( submitAnswerLogAll, studentsList, answers, answerSkills ){
        let retVal = []
        submitAnswerLogAll.forEach( log => {
            let dateTimeSubmit = log.dateTime - studentsList[log.FK_studentKey].dateTimeStart
            retVal.push({
                TypeOfAction            : "Submit Answer"
                ,UserID                 : log.FK_studentKey
                ,FirstName              : studentsList[log.FK_studentKey].FirstName
                ,LastName               : studentsList[log.FK_studentKey].LastName
                ,answerKey              : log.key
                ,answerName             : answers[log.key].nameTagKey
                ,questionKey            : answers[log.key].questionKey
                ,questionSubject        : answers[log.key].subjectTagKey
                ,isImportantQuestion    : answers[log.key].isImportant
                ,timeSpentFormatted     : this.formatTime( dateTimeSubmit )
                ,timeSpent              : dateTimeSubmit
                ,answerSkills           : answerSkills[log.key].formatedSkills
            })
        })
        return retVal
    },

    formatOpenEmailLogAll( openEmailLogAll, studentsList, questions ){
        let retVal = []
        openEmailLogAll.forEach( log => {
            let dateTimeSubmit = log.dateTime - studentsList[log.FK_studentKey].dateTimeStart
            retVal.push({
                TypeOfAction            : "Open email"
                ,UserID                 : log.FK_studentKey
                ,FirstName              : studentsList[log.FK_studentKey].FirstName
                ,LastName               : studentsList[log.FK_studentKey].LastName
                ,questionKey            : log.key
                ,questionSubject        : questions[log.key].subjectTagKey
                ,isImportantQuestion    : questions[log.key].isImportant
                ,timeSpentFormatted     : this.formatTime( dateTimeSubmit )
                ,timeSpent              : dateTimeSubmit
            })
        })
        return retVal
    },

    formatOpenMessageLogAll( openMessageLogAll, studentsList, questions ){
        let retVal = []
        openMessageLogAll.forEach( log => {
            let dateTimeSubmit = log.dateTime - studentsList[log.FK_studentKey].dateTimeStart
            retVal.push({
                TypeOfAction            : "Open Message"
                ,UserID                 : log.FK_studentKey
                ,FirstName              : studentsList[log.FK_studentKey].FirstName
                ,LastName               : studentsList[log.FK_studentKey].LastName
                ,questionKey            : log.key
                ,questionSubject        : questions[log.key].subjectTagKey
                ,isImportantQuestion    : questions[log.key].isImportant
                ,timeSpentFormatted     : this.formatTime( dateTimeSubmit )
                ,timeSpent              : dateTimeSubmit
            })
        })
        return retVal
    },

    formatOpenFileLogAll( openFileLogAll, studentsList, files ){
        let retVal = []
        openFileLogAll.forEach( log => {
            let dateTimeSubmit = log.dateTime - studentsList[log.FK_studentKey].dateTimeStart
            retVal.push({
                TypeOfAction            : "Open File"
                ,UserID                 : log.FK_studentKey
                ,FirstName              : studentsList[log.FK_studentKey].FirstName
                ,LastName               : studentsList[log.FK_studentKey].LastName
                ,fileKey                : log.key
                ,fileName               : files[log.key].displayName
                ,timeSpentFormatted     : this.formatTime( dateTimeSubmit )
                ,timeSpent              : dateTimeSubmit
            })
        })
        return retVal
    },

    formatClickImportantLogAll( clickImportantLogAll, studentsList, questions ){
        let retVal = []
        clickImportantLogAll.forEach( log => {
            let dateTimeSubmit = log.dateTime - studentsList[log.FK_studentKey].dateTimeStart
            retVal.push({
                TypeOfAction            : "Click Important"
                ,UserID                 : log.FK_studentKey
                ,FirstName              : studentsList[log.FK_studentKey].FirstName
                ,LastName               : studentsList[log.FK_studentKey].LastName
                ,questionKey            : log.key
                ,isSetToImportant       : log.value
                ,questionSubject        : questions[log.key].subjectTagKey
                ,isImportantQuestion    : questions[log.key].isImportant
                ,timeSpentFormatted     : this.formatTime( dateTimeSubmit )
                ,timeSpent              : dateTimeSubmit
            })
        })
        return retVal
    },

    // logActionTypeKey	name
    // 1	Start Game
    // 2	Complete Game
    // 3	Submit Answer
    // 4	Open Message
    // 5	Open Email
    // 6	Open File
    // 7	Click Important
    getLog( studentToSimKeyArr, FK_logActionTypeKey = null ){
        const query = db('CapsimInbox').select(
            'sts.studentToSimKey',
            'sts.FK_studentKey',
            'stl.FK_logActionTypeKey',
            'stl.key',
            'stl.value',
            'stl.dateTime'
        )
        .from('inbox_studentLog AS stl')
        .join('inbox_studentToSim AS sts', 'stl.FK_studentToSimKey', 'sts.studentToSimKey')
        .whereIn('FK_studentToSimKey', studentToSimKeyArr)
        .andWhere({
            'stl.historyKey':0
        })
        .orderBy('dateTime', 'asc')

        return ( FK_logActionTypeKey ) ? query.orWhere({ FK_logActionTypeKey }) : query
    },

    getQuestionsAndAnswers(){
        return db('CapsimInbox').select(
            'a.answerKey',
            'a.nameTagKey',
            'q.questionKey',
            'q.isImportant',
            'q.subjectTagKey'
        )
        .from('inbox_answer AS a')
        .leftJoin('inbox_question AS q', 'q.questionKey', 'a.FK_questionKey')
        .reduce( (memo,row) =>{
            memo.answers[row.answerKey] = row
            return memo;
        }, { answers:{}} )
        .then( data => data.answers)
    },

    getQuestions(){
        return db('CapsimInbox').select(
            'questionKey',
            'isImportant',
            'subjectTagKey'
        )
        .from('inbox_question')
        .reduce( (memo,row) =>{
            memo.questions[row.questionKey] = row
            return memo;
        }, { questions:{}} )
        .then( data => data.questions)
    },

    getFiles(){
        return db('CapsimInbox').select(
            'fileKey',
            'displayName'
        )
        .from('inbox_file')
        .reduce( (memo,row) => {
            memo.files[row.fileKey] = row
            return memo;
        }, { files:{}} )
        .then( data => data.files)
    },

    getAnswerSkills(){
        return db('CapsimInbox').select(
            'ats.FK_answerKey',
            'ats.points',
            's.skillKey',
            's.name'
        )
        .from('inbox_answerToSkill AS ats')
        .leftJoin('inbox_skill AS s', 's.skillKey', 'ats.FK_skillKey')
        .reduce( (memo,row) => {
            if( typeof memo.answers[row.FK_answerKey] == 'undefined'){
                memo.answers[row.FK_answerKey] = {}
                memo.answers[row.FK_answerKey].skillsArr = []
                memo.answers[row.FK_answerKey].formatedSkills = ""
            }
            memo.answers[row.FK_answerKey].skillsArr.push({
                skillName: row.name
                ,points: row.points
                ,skillKey: row.skillKey
            })
            memo.answers[row.FK_answerKey].formatedSkills += row.name + ": " + row.points + "; "

            return memo;
        }, { answers:{}} )
        .then( data => data.answers)
    },

    getSelfAssessment(versionKey){
        return db('CapsimInbox').select(
            'sts.FK_studentKey as UserID',
            's.skillKey',
            'sa.points',
            's.name',
            'sa.FK_studentToSimKey'
        )
        .from('inbox_selfAssessment as sa')
        .join('inbox_studentToSim AS sts', 'sa.FK_studentToSimKey', 'sts.studentToSimKey')
        .leftJoin('inbox_skill AS s', 's.skillKey', 'sa.FK_skillKey')
        .where({ 's.FK_versionKey': versionKey })
    },

    async buildScoreAll(versionKey){
        const skills = await Skill.where({ FK_versionKey: versionKey }).fetchAll()
        let scoreAll = await this.getInboxScoreAll(versionKey)
        let selfAssessmentAll = await this.getSelfAssessment(versionKey)

        let retVal = []

        for (var row in scoreAll) {
            let score = await gs.getScore(scoreAll[row].FK_studentToSimKey, versionKey)
            let studSelfAssessment = selfAssessmentAll.filter( el => el.FK_studentToSimKey === scoreAll[row].FK_studentToSimKey )
            const reportSkills = skills.toJSON().reduce( (obj, el) => {
                // BUG-2049, points are undefined
                try {
                    obj.skillScores[el.name] = score.skillPoints[el.skillKey]
                    obj.selfAssessed[`Self-${el.name}`] = studSelfAssessment.find( skill => skill.skillKey === el.skillKey ).points
                } catch (error) {
                    obj.selfAssessed[`Self-${el.name}`] = '-'
                }
                return obj
            }, { skillScores: {}, selfAssessed: {} })


            retVal.push(Object.assign({
                Name : scoreAll[row].FirstName + " " +scoreAll[row].LastName,
                UserID : scoreAll[row].FK_studentKey,
                SimID : scoreAll[row].SimID,
                DateCompleted : scoreAll[row].dateTime,
                Overall : score.overAllScore,
                SkillPointsSum : score.skillPointsSum,
                TotalAssessmentTime : score.timeSpent.toFixed(0),
                TimeMultiplier : score.timeBonusMultiplier,
                isPenalized : score.isPenalized,
                numberOfImportantQuestionsAnswered : score.numberOfImportantQuestionsAnswered,
                priorityBonus: score.priorityBonus
            }, reportSkills.skillScores, reportSkills.selfAssessed))
        }

        return { data: retVal, fields: Object.keys(retVal[0]) }
    },

    async getTimeBuckets(versionKey) {
        let scoreAll = await this.getInboxScoreAll(versionKey)
        let students = []

        for (var row in scoreAll) {
            let score = await gs.getScore(scoreAll[row].FK_studentToSimKey, versionKey)
            let x = score.timeSpent

            students.push({ Name: `${scoreAll[row].FirstName} ${scoreAll[row].LastName}`, SimID: scoreAll[row].SimID, Time: x.toFixed(2) })
        }

        return { data: students, fields: ["Name", "SimID", "Time"] }
    },

    getInboxScoreAll(versionKey){
        return db('CapsimInbox')
        .from('inbox_score AS score')
        .select(
            'score.FK_studentToSimKey',
            'score.overall',
            'score.dateTime as dateTimeEnd',
            'score.skillSum',
            'score.skills',
            'score.dateTime',
            'student.FirstName',
            'student.LastName',
            'sts.FK_studentKey',
            'sts.FK_simKey',
            'sim.SimID'
        )
        .join('inbox_studentToSim AS sts', 'sts.studentToSimKey', 'score.FK_studentToSimKey')
        .join('inbox_versionToSim AS vts', 'vts.simKey', 'sts.FK_simKey')
        .join(process.env.capstoneDb + 'Sim AS sim', 'sim.simKey', 'sts.FK_simKey')
        .leftJoin(process.env.capstoneDb + 'student AS student', 'student.studentKey', 'sts.FK_studentKey')
        .where({'vts.versionKey': versionKey,'score.historyKey':0})
    },

    getSimulationData2() {
        return Promise.all([gd.getQuestions(), gd.getAnswers(), gd.getAnswerSkills(), gd.getFiles(), gd.getFolders()])
    },

    buildSimulationData2() {
        return this.getSimulationData2()
        .then( ([questions, answers, answerSkills, files, folders]) => {
            for(var i = 0; i < answers.length; i++ ){
                answers[i].skills = answerSkills.filter(function(skill){ return skill.FK_answerKey == answers[i].answerKey })
            }

            for(var i = 0; i < questions.length; i++ ){
                questions[i].answers = answers.filter(function(answer){ return answer.FK_questionKey == questions[i].questionKey })
            }
            let emails = questions.filter(function(element){ return element.FK_questionDisplayTypeKey == 1; })
            let messages = questions.filter(function(element){ return element.FK_questionDisplayTypeKey == 2; })
            return { emails, messages, files, folders, questions }
        })
    },

    async recalculateScoreAll(versionKey){
        let scoreAll = await this.getInboxScoreAll(versionKey)
        let start = new Date();
        for (let row in scoreAll) {
            await gs.updateScore(scoreAll[row].FK_studentToSimKey, versionKey)
        }
        let end = new Date() - start;
        return end
    },



    /**
     * async itemLevelData - This report outputs the questions answered, time, answer and skill
     * associated with answer for each student in version
     *
     * @param  {Strng | Number} versionKey version key to use for student data
     * @returns {Object} Object containing an array of students with the above properties
     * and an array of fields to be used for genreating CSV headers
     */
    async itemLevelData( versionKey ) {
        const logs      = await this.getAnswerLogs( versionKey, CONSTANTS.LOG_ACTION_KEY.SUBMIT_ANSWER )
        const skills    = await Skill.where({ FK_versionKey: versionKey }).fetchAll()
        const skillsObj = skills.toJSON()
        const answerToSkills   = await this.getAnswerToSkills( versionKey )
        const data      = logs.reduce(( dataArray, log ) => {
            skillsObj.forEach( skill => {
                const skillToAnswer = answerToSkills.find( ats => ((ats.FK_skillKey == skill.skillKey) && (ats.FK_answerKey == log.ReponseID)) )
                log[skill.name] = (skillToAnswer) ? skillToAnswer.points : 0
            })
            dataArray.push(log)
            return dataArray
        }, [])
        return { data, fields: ['FirstName', 'LastName', 'SimID', 'StimuliID', 'ReponseID', 'Time'].concat( skillsObj.map( s => s.name ) ) }
    },

    getAnswerLogs( FK_versionKey, FK_logActionTypeKey ) {
        return db('CapsimInbox').select(
            'stu.FirstName',
            'stu.LastName',
            'stl.key AS StimuliID',
            'stl.value AS ReponseID',
            'sim.SimID'
        )
        .min('stl.dateTime AS Time')
        .from('inbox_studentLog AS stl')
        .join('inbox_questionToVersion AS qtv', 'qtv.FK_questionKey', 'stl.key')
        .join('inbox_studentToSim AS sts', 'sts.studentToSimKey', 'stl.FK_studentToSimKey')
        .join(process.env.capstoneDb + 'Student AS stu', 'stu.studentKey', 'sts.FK_studentKey')
        .join(process.env.capstoneDb + 'Sim AS sim', 'sim.simKey', 'sts.FK_simKey')
        .where({ 'stl.FK_logActionTypeKey': FK_logActionTypeKey, 'qtv.FK_versionKey': FK_versionKey, 'stl.historyKey':0 })
        .groupBy( 'stu.FirstName','stu.LastName','stl.key','stl.value','sim.SimID')
        .orderBy('stu.LastName')

    },

    getAnswerToSkills( FK_versionKey ) {
        return db('CapsimInbox').select(
            'ats.FK_answerKey',
            'ats.FK_skillKey',
            'ats.points'
        )
        .from('inbox_answerToSkill AS ats')
        .join('inbox_skill AS is', 'ats.FK_skillKey', 'is.skillKey')
        .where({ 'is.FK_versionKey': FK_versionKey })
    }

})
