const db = require('./db.js')
const moment = require('moment')
const ss = require('./studentSetting.js');
const crypto = require('crypto');
const secret = 'secret';
const rd = require('./reportData.js');
const sr = require('./studentReport.js');
const EntryQuestionnaire = require('../resources/entryQuestion')
const PostAssessmentQuestion = require('../resources/postAssessmentQuestion')
const lmsSetting = require('./lmsSetting.js')

const capstoneDatasource = process.env.capstoneDb


// const { courseSettings } = require('./cte');
PortalData = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( PortalData.prototype, {

    async setStudentSession(studentkey, sectionkey, stsKey, simID, isNewRegistration){

        let sessionData = {}

        let { simKey } = await this.getSimKeyID(simID)
        const courseInfo = await this.getCourseInfo( simKey )
        let { courseTitle, reportAvailableDate, localClassStartDate, localClassEndDate, schoolKey} = courseInfo[0]
        let { versionKey } = await this.getVersion( stsKey )
        let { isExam, timer } = await this.getVersionInfo( versionKey )
        let versionData = await this.getVersionInfo(versionKey)
        let versionConfig = JSON.parse(versionData.versionConfig)
        let isReEntry = versionConfig.reEntry
        let isReEntrySingle = versionConfig.reEntrySingle
        let skipWelcome = versionConfig.skipWelcome
        let hideTimer = versionConfig.hideTimer
        let postAssessment = versionConfig.postAssessment
        let showTimerAsClock = versionConfig.showTimerAsClock
        let startTime = versionConfig.startTime
        let skillMap = await this.getSkillMap()
        sessionData.data = await this.getStudentInfo( stsKey )
        sessionData.studentkey = studentkey
        sessionData.sectionkey = sectionkey
        sessionData.simKey =  simKey
        sessionData.stsKey = stsKey
        sessionData.versionKey = versionKey
        sessionData.data.isExam = isExam
        sessionData.isExam = isExam
        sessionData.isReEntry = isReEntry
        sessionData.skipWelcomeVideo = skipWelcome
        sessionData.hideTimer = hideTimer
        sessionData.postAssessment = postAssessment
        sessionData.showTimerAsClock = showTimerAsClock
        sessionData.startTime = startTime
        sessionData.data.studentkey = studentkey
        sessionData.data.courseTitle = courseTitle
        sessionData.data.startDateTime = localClassStartDate
        sessionData.data.endDateTime = localClassEndDate
        sessionData.data.skillMap = skillMap
        sessionData.data.timer = timer
        sessionData.data.reportAvailableDate = reportAvailableDate
        sessionData.data.schoolKey = schoolKey
        sessionData.data.simID = simID
        sessionData.data.isReEntry = isReEntry
        sessionData.data.isReEntrySingle = isReEntrySingle
        sessionData.data.skipWelcomeVideo = skipWelcome
        sessionData.data.hideTimer = hideTimer
        sessionData.data.postAssessment = postAssessment
        sessionData.data.showTimerAsClock = showTimerAsClock
        sessionData.data.startTime = startTime
        sessionData.data.isNewRegistration = isNewRegistration
        sessionData.isNewRegistration = isNewRegistration

        if(isExam == 1){
            await lmsSetting.updateLmsAdaStudentTimer({studentkey,simKey,versionTimer:timer,stsKey})
        }

        return sessionData
    },

    /**
     * checkStudentToSim - insert studentToSim if non-existent
     *
     * @param  {number} studentKey
     * @param  {string} simID
     * @return {object} studentToSim record
     */
    async checkStudentToSim( FK_studentKey, simID ) {
       let activeStudent
       let sim = await db('Capstone').table('Sim').select('simKey').where({ simID }).first()

       //returns all modx and inbox sims that have been registered in studentToSim table
       let stsKeys = await db('CapsimInbox').table('inbox_studentToSim').select('FK_simkey').where({ FK_studentKey })
       let stsKeyArr = stsKeys.map(elem =>elem.FK_simkey)

       //returns all inbox and modx sims according to shopping cart
       let simKeys = await this.getShoppingCartAssessments(FK_studentKey)
       let simKeyArr = simKeys.map(elem => elem.FK_simkey)

       //filters out keys from simKeyArr that already have stsKey, and then creates stsKeys for the rest
        let stsKeysToAdd = simKeyArr.filter(key=>stsKeyArr.indexOf(parseInt(key)) < 0)
        for(let i = 0; i < stsKeysToAdd.length; i++){
                await db('CapsimInbox').table('inbox_studentToSim')
                .returning('studentToSimKey')
                .insert({ FK_studentKey, FK_simKey: stsKeysToAdd[i]})
        };

        activeStudent = await db('CapsimInbox').table('inbox_studentToSim').where({ FK_studentKey, FK_simKey: sim.simKey}).first()
        return activeStudent.studentToSimKey
    },

    async getAllAssessments( FK_studentKey, sectionKey ) {
        let token = crypto.createHash('md5').update(`${FK_studentKey}${sectionKey}${secret}`).digest("hex").toUpperCase()
        let assessmentsArr = await db('CapsimInbox').select(
            'studentToSimKey',
            'FK_studentKey',
            'FK_simKey'
        )
        .from('inbox_studentToSim')
        .where({FK_studentKey})


        let skillMap = await this.getSkillMap()

        let stsKeyArr = assessmentsArr.map(elem => elem.studentToSimKey)
        let simKeyArr = assessmentsArr.map(elem => elem.FK_simKey)

        let simIds = await db('Capstone').select('simID', 'simKey').from('sim').whereIn('simKey', simKeyArr)

        let courseInfo = await this.getCourseInfo( simKeyArr )

        let studentInfo = await this.getStudentInfo( stsKeyArr )

        let versionKeys = await this.getVersion( stsKeyArr )
        let versionKeyArr = versionKeys.map(elem =>elem.versionKey)

        let completionDates = await db('CapsimInbox').table('inbox_studentLog').select("dateTime AS completionDate", "FK_studentToSimKey").whereIn("FK_studentToSimKey", stsKeyArr).where({ FK_logActionTypeKey: 2,'historyKey':0 })

        let scoresPromiseArr = stsKeyArr.map((item, i) =>{
            return sr.buildReport(item, versionKeyArr[i])
        })

        let FK_MeasurementTypeKey = 1

        let params = {
            "whereIn":{
                "column": "FK_versionKey",
                "values": versionKeyArr
            },
        }
        let skills =  await rd.getMeasurement( FK_MeasurementTypeKey, params )

        let scores = await Promise.all(scoresPromiseArr)

        //es6 Set gives unique values
        let uniqueVersionKeys  = [ ...new Set(versionKeyArr) ]
        let versionData = await this.getVersionInfo( uniqueVersionKeys )
        let questions = await EntryQuestionnaire.where('FK_versionKey', 'in', uniqueVersionKeys).fetchAll({ withRelated: 'entryAnswers' })
        questions = questions.toJSON()

        let settingsData = await ss.getSettings(stsKeyArr)
        let files = await rd.getStudentFiles(stsKeyArr)
        let cycles =  await db('CapsimInbox').select().from('inbox_cycleToStudent').whereIn('FK_studentToSimKey', stsKeyArr)
        let postAssessmentQuestions = await PostAssessmentQuestion.where('FK_versionKey', 'in', uniqueVersionKeys).fetchAll({ withRelated: 'construct' })
        postAssessmentQuestions = postAssessmentQuestions.toJSON()
        let assessments = {}

        for(let i = 0; i < assessmentsArr.length; i++){
            let j =  assessmentsArr[i].studentToSimKey
            assessments[j] = {}
            assessments[j].sectionKey = sectionKey
            assessments[j].attrSec = token
            assessments[j].settings = {}
            simIds.map((item)=>{
                if(item.simKey == assessmentsArr[i].FK_simKey){
                    assessments[j].simID = item.simID
                }
            })
            versionKeys.map((item)=>{
                if(item.studentToSimKey == assessmentsArr[i].studentToSimKey){
                    assessmentsArr[i].versionKey = item.versionKey
                }
            })

           assessments[j].questions = questions.filter((element)=> element.FK_versionKey == assessmentsArr[i].versionKey )
           assessments[j].skills = skills.filter((element)=> element.FK_versionKey == assessmentsArr[i].versionKey )

            versionData.map((item)=>{
                if(item.versionKey == assessmentsArr[i].versionKey){
                    assessments[j].versionName = item.versionName
                    assessments[j].versionSettings = JSON.parse(item.versionConfig)
                    assessments[j].versionKey = item.versionKey
                    assessments[j].isExam = item.isExam
                    assessments[j].timer = item.timer
                }
            })

            studentInfo.map((item)=>{
                if(item.studentToSimKey == assessmentsArr[i].studentToSimKey){
                    assessments[j].lastname = item.lastname
                    assessments[j].firstname = item.firstname
                    assessments[j].student_type = item.student_type
                    assessments[j].loginCounter = item.loginCounter
                    assessments[j].email = item.email
                }
            })
            completionDates.map((item)=>{
                if(item.FK_studentToSimKey == assessmentsArr[i].studentToSimKey){
                    assessments[j].completionDate = item.completionDate
                }
            })

            scores.map((item)=>{
                if(item && item.studentToSimKey == assessmentsArr[i].studentToSimKey){
                    assessments[j].report = item
                }
            })

            assessments[j].studentFiles = []
            files.map((item)=>{
                if(item.FK_studentToSimKey == assessmentsArr[i].studentToSimKey){
                    assessments[j].studentFiles.push(item)
                }
            })

            cycles.map((item)=>{
                if(item.FK_studentToSimKey == assessmentsArr[i].studentToSimKey){
                    assessments[j].cycle=item.FK_cycleKey
                }
            })

            assessments[j].postAssessmentQuestions = postAssessmentQuestions.filter(element => element.FK_versionKey == assessmentsArr[i].versionKey )

            courseInfo.map((item)=>{
                if(item.simKey == assessmentsArr[i].FK_simKey){
                    let { courseTitle, reportAvailableDate, localClassStartDate, localClassEndDate, schoolKey } = item
                    assessments[j].courseTitle = courseTitle
                    assessments[j].reportAvailableDate = reportAvailableDate
                    assessments[j].startDateTime = localClassStartDate
                    assessments[j].endDateTime = localClassEndDate
                    assessments[j].schoolKey = schoolKey
                }
            })
            settingsData.map((item)=>{
                if(item.FK_studentToSimKey == assessmentsArr[i].studentToSimKey){
                    assessments[j].settings =  JSON.parse(item.settingJSON)
                }
            })
            if(assessments[j].settings.assessment && assessments[j].settings.assessment.completed) {
                assessments[j].isComplete = true
            }
        }
        return assessments
    },

    getVersion( studentToSimKey ) {
        let retVal =  db('CapsimInbox').select('vts.versionKey', 'sts.studentToSimKey')
            .from('inbox_versionToSim AS vts')
            .join('inbox_studentToSim AS sts', 'sts.FK_simKey', 'vts.simKey')

            if(Array.isArray(studentToSimKey)){
                retVal = retVal.whereIn( 'sts.studentToSimKey', studentToSimKey )
            } else {
                retVal = retVal.where({ 'sts.studentToSimKey': studentToSimKey }).first()
            }

        return retVal
    },

    getVersionInfo( versionKey ) {
        let retVal = db('CapsimInbox').select(
            'inbox_version.timer',
            'inbox_version.isExam',
            'inbox_version.professorSurveyLink',
            'inbox_version.versionName',
            'inbox_version.versionKey',
            'inbox_version.versionConfig')
        .from('inbox_version')

            if(Array.isArray(versionKey)){
                retVal = retVal.whereIn( 'versionKey', versionKey )
            } else {
                retVal = retVal.where({versionKey}).first()
            }

        return retVal
    },

    async getVersionConfig( simKey ) {
        let config = await db('CapsimInbox').select(
            'v.versionConfig'
        )
        .from('inbox_version as v')
        .innerJoin('inbox_versionToSim AS vts', 'vts.versionKey', 'v.versionKey')
        .where({'vts.simKey': simKey})
        .first()
        return {versionConfig: JSON.parse(config.versionConfig)}
    },

    async getShoppingCartAssessments( FK_studentKey ) {
        let assessments = await
        db('Capstone')
        .select('sim.simkey as FK_simkey')
        .from('SectionShoppingCart')
        .innerJoin('sim', 'SectionShoppingCart.simkey', 'sim.simKey')
        .innerJoin('editionToProduct', 'SectionShoppingCart.ProductKey', 'editionToProduct.productkey')
        .innerJoin('Edition', 'editionToProduct.editionKey', 'Edition.editionKey')
        .innerJoin('commerce_student_purchases', 'SectionShoppingCart.SectionShoppingCartKey', 'commerce_student_purchases.FK_sectionShoppingCartkey')
        .where({'commerce_student_purchases.studentkey': FK_studentKey, 'SectionShoppingCart.ProductCategoryKey': '1', 'editionToProduct.editionKey': 14})

        return assessments
    },

    // =======================================
    // ========= Self Assessment =============
    // =======================================
    getSelfSkill( FK_studentToSimKey ){
        return db('CapsimInbox').select()
        .from('inbox_selfAssessment')
        .where({ FK_studentToSimKey })

    },

    removeSelfSkill( FK_studentToSimKey ){
      return db('CapsimInbox').table('inbox_selfAssessment').where({ FK_studentToSimKey }).del()
  },

    async setSelfSkill( data, FK_studentToSimKey ){

        const selfSkill = await this.getSelfSkill( FK_studentToSimKey )
        if(selfSkill.length > 0) await this.removeSelfSkill( FK_studentToSimKey )

        return db('CapsimInbox').insert(data)
            .into('inbox_selfAssessment')
    },

    // =======================================
    // =========== Post Assessment ===========
    // =======================================

    async setPostAssessmentAnswers( data, FK_studentToSimKey ){
        const answers = await db('CapsimInbox').select().from('postAssessment_answer').where({ FK_studentToSimKey })
        if(answers.length > 0) await db('CapsimInbox').table('postAssessment_answer').where({ FK_studentToSimKey }).del()

        return db('CapsimInbox').batchInsert('postAssessment_answer', data)
    },

    // =======================================
    // =========== Questionnaire =============
    // =======================================

    getQuestionnaireAnswers( FK_studentToSimKey ){
      return db('CapsimInbox').select()
      .from('entry_studentToAnswer')
      .where({ FK_studentToSimKey })
  },

    removeQuestionnaireAnswers( FK_studentToSimKey ){
      return db('CapsimInbox').table('entry_studentToAnswer').where({ FK_studentToSimKey }).del()
    },

    async setQuestionnaire( data, FK_studentToSimKey ){
      const questionnaireAnswers = await this.getQuestionnaireAnswers( FK_studentToSimKey )
      if(questionnaireAnswers.length > 0) await this.removeQuestionnaireAnswers( FK_studentToSimKey )

      return db('CapsimInbox').batchInsert('entry_studentToAnswer', data)
  },

    // =============================================================
    // ========= General person and course information =============
    // =============================================================

    getSkillMap(){
        return db('CapsimInbox').select()
        .from('inbox_skillToSkill')
    },

    async getStudentInfo( studentToSimKey ) {
        let retVal = db('Capstone').select(
            's.lastname',
            's.firstname',
            's.student_type',
            's.loginCounter',
            's.email',
            'sts.studentToSimKey'
        )
        .from('student AS s')
        .join(process.env.capsimInboxDb + 'inbox_studentToSim AS sts', 's.studentKey', 'sts.FK_studentKey')

        if(Array.isArray(studentToSimKey)){
            retVal = retVal.whereIn( 'sts.studentToSimKey', studentToSimKey )
        } else {
            retVal = retVal.where({ 'sts.studentToSimKey': studentToSimKey }).first()
        }
        return retVal
    },

    getStudentAccountInfo( studentkey ){
        return db('Capstone').first(
                's.lastname',
                's.firstname',
                's.student_type',
                's.username',
                's.password',
                's.hint',
                's.email',
                's.phone',
                's.salt',
                's.sectionkey',
                's.loginCounter'
            )
            .from('student AS s')
            .where('studentKey', studentkey)
    },

    getProfessorInfo( professorkey ){
        return db('Capstone').first(
                's.lastname',
                's.firstname'
            )
            .from('professor AS s')
            .where('professorkey', professorkey)
    },


    getSimKey(sectionKey) {
        return db('Capstone').first('sim.simKey')
        .from('sim AS sim')
        .where('sim.sectionKey', sectionKey)
    },

    getSimKeyID(simID) {
        return db('Capstone').first('sim.simKey')
        .from('sim AS sim')
        .where('sim.simid', simID)
    },

    getCourseInfo (simKey) {
        const rawQuery =
        process.env.capstoneDb + 'Msiconvertesttolocal_([cs].startdatetime, [s].worldtimekey, [s].dstpref, [s].timeampm) AS [localClassStartDate]'
        + ',' +
        process.env.capstoneDb + 'Msiconvertesttolocal_([simulation].resultsavailable2, [s].worldtimekey, [s].dstpref, [s].timeampm) AS [reportAvailableDate]'
        + ',' +
        process.env.capstoneDb + 'Msiconvertesttolocal_([cs].enddatetime, [s].worldtimekey, [s].dstpref, [s].timeampm)   AS [localClassEndDate]';

        return retVal = db('CapsimInbox')
            .select(
                's.courseTitle',
                's.startDateTime',
                's.schoolnameKey',
                'schoollocation.schoolKey',
                's.endDateTime',
                's.worldtimekey AS worldtimeKey',
                's.timeampm AS timeAMPM',
                's.dstpref AS dstPref',
                'simulation.simID',
                'simulation.simKey',
                'simulation.enrollmentKey')
            .select(db('Capstone').raw(rawQuery))
            .from('inbox_courseSettings as cs')
            .innerJoin(process.env.capstoneDb + 'sim AS simulation', 'simulation.simKey', 'cs.FK_simKey')
            .innerJoin(process.env.capstoneDb + 'section AS s', 's.sectionKey','simulation.sectionKey')
            .innerJoin(process.env.capstoneDb + 'schoollocation', 'schoollocation.schoolnamekey', 's.schoolnamekey')
            .whereIn('simulation.simKey', simKey)
            .then(result => {
                for(let i = 0; i < result.length; i++){
                    let { localClassStartDate, reportAvailableDate, localClassEndDate } = result[i]
                    if (reportAvailableDate === undefined || reportAvailableDate === null) {
                        reportAvailableDate = localClassStartDate
                    }
                    result[i].localClassStartDate =  moment.utc(localClassStartDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
                    result[i].reportAvailableDate =  moment.utc(reportAvailableDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
                    result[i].localClassEndDate =  moment.utc(localClassEndDate.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
                }
                return result
            })
    },


    convertLocalToEST (startDateTime, endDateTime , sectionkey ) {
        // Cast as string, knex will f'up any date conversations for this function
        const rawQuery =
        'convert(varchar(50), dbo.Msiconvertlocaltoest(:startDateTime, s.worldtimekey, s.dstpref), 120) as [startDateTime]'
        + ',' +
        'convert(varchar(50), dbo.Msiconvertlocaltoest(:endDateTime, s.worldtimekey, s.dstpref), 120) as [endDateTime]';

        return db('Capstone')
        .select(db('Core').raw(rawQuery, {
            startDateTime: startDateTime,
            endDateTime: endDateTime
        }))
        .from('section AS s')
        .where('s.sectionkey', sectionkey)
        .then(result => this.localFormat(result))
    },

    convertESTToLocal (startDateTime, endDateTime , sectionkey ) {
        const rawQuery =
        'dbo.Msiconvertesttolocal_(:startDateTime, s.worldtimekey, s.dstpref, s.timeAMPM) as [startDateTime]'
        + ',' +
        'dbo.Msiconvertesttolocal_(:endDateTime, s.worldtimekey, s.dstpref, s.timeAMPM) as [endDateTime]';

        return db('Capstone')
        .select(db('Core').raw(rawQuery, {
            startDateTime: startDateTime,
            endDateTime: endDateTime
        }))
        .from('section AS s')
        .where('s.sectionkey', sectionkey)
        .then(result => {
            // get stop result and convert the Msi list function to a date
            const top = result[0]
            let { startDateTime, endDateTime } = top
            top.startDateTime =  moment.utc(startDateTime.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
            top.endDateTime =  moment.utc(endDateTime.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
            return top
        })
    },


    getIndustryRoster( sectionkey ){
        return db('Capstone').select(
                's.FirstName',
                's.LastName',
                's.Email',
                's.SimID',
                's.LogInCounter',
                's.LastLogInTimeStamp',
                's.RegistrationNumber'
            )
            .from('student AS s')
            .where('sectionkey', sectionkey)
    },

    getProfessorResources(FK_versionKey) {
        return db('CapsimInbox').select("inbox_file.*").from('inbox_file').innerJoin('inbox_professorResources AS pr','pr.FK_fileKey','inbox_file.fileKey').where({ "pr.FK_versionKey": FK_versionKey })
    },

    // manageCourse.cfc: getCountryList()
    getCountryList () {
        return db('Capstone').select(
            'country'
        )
        .countDistinct('location_id as locationCount')
        .from('worldtime')
        .groupBy('country')
    },

    // worldtime.cfc: getLocationsForCountry()
    getRegionList(country) {
        return db('Capstone').select(
            'region',
            'city_list'
        )
        .max('worldtimekey as worldtimeKey')
        .from('worldtime')
        .where('country', country)
        .groupBy('region', 'city_list')
        .orderBy('region', 'city_list')
    },

    // worldtime.cfc: getTZDataForLocation()
    getTZDataForLocation (worldtimekey) {
        return db('Capstone')
        .first(
            'w.nextYearDstEnd',
            'w.nextYearDstStart',
            'w.thisYearDstEnd',
            'w.thisYearDstStart',
            'w.genName',
            'w.country'
        )
        .from('worldtime as w')
        .where('w.worldtimekey', worldtimekey)
        .whereNotNull('w.thisYearDstEnd','w.thisYearDstStart')
        .orderBy('w.region')
        .then(result => {
            const { country, genName, nextYearDstStart, thisYearDstEnd, thisYearDstStart } = result
            const now = new Date()

            let switchDate = nextYearDstStart
            let switchType = 'Daylight'

            if (!(now > thisYearDstEnd)) {
                switchDate = thisYearDstEnd
                switchType = 'Standard'
            }
            if (!(now > thisYearDstStart)) {
                switchDate = thisYearDstStart
                switchType = 'Daylight'
            }

            switchDate = moment.utc(switchDate).format('MM/DD/YYYY hh:mm a')
            return { country, genName, switchDate, switchType }
        })
    },


    getCountryDetails(worldtimeKey) {
        return db('Capstone').select(
            'worldtimeKey',
            'region',
            'country',
            'city_list'
        )
        .first()
        .from('worldtime')
        .where({ worldtimeKey })
    },

    updateSection( key, value, sectionKey ) {
        return db('Capstone')
            .table('Section')
            .where({sectionKey})
            .update({
                [key]: value
            })
            .returning(['courseTitle', 'startDateTime', 'endDateTime'])
    },

    // Fix/refactor, the MSIConvertLocalToEST functions dont work unless they are in raw format, because the knex string parsing
        updateSectionRaw(newValue, simKey) {
            return db('CapsimInbox')
            .raw('UPDATE inbox_coursesettings SET startDateTime = dbo.MSIConvertLocalToEST(:startDateTime, :worldtimeKey, :dstPref), endDateTime = dbo.MSIConvertLocalToEST(:endDateTime, :worldtimeKey, :dstPref) output inserted.[courseTitle], inserted.[startDateTime], inserted.[endDateTime] WHERE FK_simKey = :simKey', {
                startDateTime: newValue.startDateTime,
                endDateTime: newValue.endDateTime,
                worldtimeKey: newValue.worldtimeKey,
                dstPref: newValue.dstPref,
                timeAMPM: newValue.timeAMPM,
                simKey: simKey
            })
            .then(result => this.localFormat(result))
    },

    updateCourseSettings(newValue, simKey)  {
        newValue.timeAMPM = (newValue.timeAMPM == true)? 1 : 0
        const rawQuery =
        'BEGIN TRANSACTION' + ' '
            + 'DECLARE @OutputTbl TABLE (startDateTime DATETIME, endDateTime DATETIME)' + ' '
            + 'DECLARE @SectionKey INT' + ' '
            + 'SET @SectionKey = (SELECT sectionKey FROM ' + capstoneDatasource + 'sim WHERE simkey = :simKey)' + ' '
            + 'UPDATE [inbox_coursesettings] SET startDateTime = ' + capstoneDatasource + 'MSIConvertLocalToEST(:startDateTime, :worldtimeKey, :dstPref), endDateTime = ' + capstoneDatasource + 'MSIConvertLocalToEST(:endDateTime, :worldtimeKey, :dstPref)' + ' '
            + 'OUTPUT inserted.[startDateTime], inserted.[endDateTime] INTO @OutputTbl(startdatetime, enddatetime)' + ' '
            + 'WHERE FK_simKey = :simKey'+ ' '
            + 'UPDATE '+ capstoneDatasource +'[section] SET '+ capstoneDatasource +'[section].[enddatetime] = (SELECT [enddatetime] FROM @OutputTbl)' + ' '
            + 'Where '+ capstoneDatasource +'[section].[sectionKey] = @SectionKey' + ' '
            + 'AND '+ capstoneDatasource +'[section].[enddatetime] < (SELECT [enddatetime] FROM @OutputTbl)' + ' '
            + 'SELECT ' + capstoneDatasource + 'MSIConvertESTToLocal_([startDateTime], :worldtimeKey, :dstPref, :timeAMPM) as [startDateTime]  ,' + capstoneDatasource + 'MSIConvertESTToLocal_([endDateTime], :worldtimeKey, :dstPref, :timeAMPM) as [endDateTime]  FROM [inbox_coursesettings] ' + ' '
            + 'WHERE FK_simKey = :simKey'+ ' '
        + 'COMMIT'
        return db('CapsimInbox')
        .raw(rawQuery, {
            startDateTime: newValue.startDateTime,
            endDateTime: newValue.endDateTime,
            reportAvailableDate: newValue.resultsavailable2,
            worldtimeKey: newValue.worldtimeKey,
            dstPref: newValue.dstPref,
            timeAMPM: newValue.timeAMPM,
            simKey: simKey
        })
        .then(result => {
            const top = result[0]
            const { startDateTime, endDateTime } = top
            top.startDateTime = moment.utc(startDateTime.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
            top.endDateTime = moment.utc(endDateTime.split('|')[0], 'MM/DD/YYYY hh:mm a').format('MM/DD/YYYY hh:mm a')
            return top
        }
    )
    },


    updateResultsavailable2Raw(newValue, simKey ) {
        return db('Capstone')
        .raw('UPDATE ' + capstoneDatasource + 'sim SET resultsavailable2 = ' + capstoneDatasource + 'MSIConvertLocalToEST(:resultsavailable2, :worldtimeKey, :dstPref) WHERE ' + capstoneDatasource + 'sim.simKey = :simKey', {
            resultsavailable2: newValue.resultsavailable2,
            worldtimeKey: newValue.worldtimeKey,
            dstPref: newValue.dstPref,

            simKey: simKey
        })
    },

    updateSim( key, value, sectionKey ) {
        return db('Capstone')
        .table('Sim')
        .where({sectionKey})
        .update({
            [key]: value
        })
        .returning(['simID', 'resultsavailable2 AS reportAvailableDate', 'enrollmentKey'])
    },

    updateStudentAccount( studentKey, data ) {
        return db('Capstone')
        .table('student')
        .where({studentKey})
        .update( data )
    },

    updateStudentGrade( FK_studentToSimKey, FK_questionKey, grade ) {
        return db('CapsimInbox')
        .table('inbox_studentToAnswerWritten')
        .where({FK_studentToSimKey, FK_questionKey})
        .update({professorGrade: grade})
        .returning('professorGrade')
    },

    // Get start/stop result and convert it into a moment date object.
    localFormat(result) {
        const top = result[0]
        const { startDateTime, endDateTime } = top
        top.startDateTime = moment.utc(startDateTime).format('MM/DD/YYYY hh:mm a')
        top.endDateTime = moment.utc(endDateTime).format('MM/DD/YYYY hh:mm a')
        return top
    }

})
