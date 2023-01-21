const express = require('express')
const router = express.Router()
const game = require('../services/gameData')
const gameScore = require('../services/gameScore')
const ss = require('../services/studentSetting')
const asyncWrap = require('../middleware/asyncWrap')
const Info = require('../services/info')
const modexReportEmail = require('../services/studentPrintReport')
const examInProgress = require('../middleware/examInProgress')
const constants = require('../services/constants.js')
const sa = require('../services/studentAdmin.js')


router.get('/data', asyncWrap( async (req, res, next) => {
    if(req.session.isExam == 1) await sa.updateStudentTimer(req.session.simKey, req.session.stsKey, req.session.versionKey )
    const data = await game.buildSimulationData(req.session.stsKey, req.session.sectionkey, null, null, req.session.isReEntry)
    data.assessmentTypeKey = constants.ASSESSMENT_TYPE_KEY.WEBAPP
    res.status(200).json(data);
}));

router.post('/answer', asyncWrap( async (req, res, next) => {
    let answers = req.body['answerkey[]'] || req.body['answerkey']
    let questionkey = req.body.questionkey
    let isSmartThreading = req.body.isSmartThreading
    let isMessage = req.body.isMessage
    let FK_logActionTypeKey = 3
    if(isSmartThreading == 1) FK_logActionTypeKey = 10 
    if(isMessage) FK_logActionTypeKey = 4
    let getStudentAnswer = await game.getStudentAnswer({FK_studentToSimKey: req.session.stsKey, FK_questionKey:questionkey})
    // Checks if student has already answered this question
    if(getStudentAnswer.length == 0){
        const answer = []
        const log = []
        if(typeof answers == 'object'){
            answers.forEach( answerKey => {
                answer.push({FK_studentToSimKey: req.session.stsKey, FK_questionKey:req.body.questionkey,FK_answerKey:answerKey})
                log.push({ FK_studentToSimKey: req.session.stsKey, FK_logActionTypeKey, key: req.body.questionkey, value: answerKey })
            })
        } else  {
            if (isSmartThreading != 1) answer.push({FK_studentToSimKey: req.session.stsKey, FK_questionKey:req.body.questionkey,FK_answerKey:answers})
            log.push({ FK_studentToSimKey: req.session.stsKey, FK_logActionTypeKey, key: req.body.questionkey, value: answers })
        }
        Promise.all([ game.setMultiAnswer(answer), game.setMultiLog(log) ])
        .then( dataArray => res.status(200).json(dataArray) )
        .catch( err => res.status(400).json( err ) )
    }else{
        res.status(400).json({message:"question has been already answered."})
    }
    
}))

router.post('/written', asyncWrap( async (req, res, next) => {
    const writtenAnswer = req.body.writtenResponse
    const questionkey = req.body.questionkey
    //Need to find out why sometimes this is an array and sometimes it is a string
    const stsKey = Array.isArray(req.session.stsKey) ? req.session.stsKey[0] : req.session.stsKey 
    const getWrittenAnswer = await game.getWrittenAnswer(stsKey, questionkey)
    
    // Checks if student has already answered this question
    if(getWrittenAnswer.length == 0){
        const answer = {FK_StudentToSimKey: stsKey, FK_questionKey: questionkey, writtenResponse: writtenAnswer}
        const log = {FK_studentToSimKey: stsKey, FK_logActionTypeKey: 3, key: questionkey}
        Promise.all([ game.setWrittenAnswer(answer), game.setMultiLog(log) ])
        .then( dataArray => res.status(200).json(dataArray) )
        .catch( err => res.status(400).json( err ) )
    }else{
        res.status(400).json({message:"question has been already answered."})
    }
    
}))

router.post('/savedraft', asyncWrap( async (req, res, next) => {
    const writtenAnswer = req.body.writtenResponse
    const questionkey = req.body.questionkey
    //Need to find out why sometimes this is an array and sometimes it is a string
    const stsKey = Array.isArray(req.session.stsKey) ? req.session.stsKey[0] : req.session.stsKey 
    const getWrittenAnswer = await game.getWrittenDraft(stsKey, questionkey)
    
    // Checks if student has already answered this question
    if(getWrittenAnswer.length == 0){
        const answer = {FK_StudentToSimKey: stsKey, FK_questionKey: questionkey, writtenResponse: writtenAnswer}
        Promise.all([ game.setWrittenDraft(answer) ])
        .then( dataArray => res.status(200).json(dataArray) )
        .catch( err => res.status(400).json( err ) )
    }else{
        const answer = {FK_StudentToSimKey: stsKey, FK_questionKey: questionkey, writtenResponse: writtenAnswer}
        Promise.all([ game.updateWrittenDraft(answer) ])
        .then( dataArray => res.status(200).json(dataArray) )
        .catch( err => res.status(400).json( err ) )
    }
    
}))

router.post('/get_savedraft', asyncWrap( async (req, res, next) => {
    const questionkey = req.body.questionkey
    //Need to find out why sometimes this is an array and sometimes it is a string
    const stsKey = Array.isArray(req.session.stsKey) ? req.session.stsKey[0] : req.session.stsKey 
    const getWrittenAnswer = await game.getWrittenDraft(stsKey, questionkey)
    
    // Checks if student has already answered this question
    if(getWrittenAnswer.length == 0){
        const answer = {FK_StudentToSimKey: stsKey, FK_questionKey: questionkey}
        Promise.all([ game.getWrittenDraft(answer) ])
        .then( dataArray => res.status(200).json(dataArray) )
        .catch( err => res.status(400).json( err ) )
    }
    
}))


router.post('/update', async (req, res, next) => {
    let answer = [ req.session.stsKey, req.body.questionkey, req.body.oldAnswerkey]
    let updatedAnswer = [ req.body.newAnswerkey ]
    let log = { FK_studentToSimKey: req.session.stsKey, FK_logActionTypeKey: 3, key: req.body.questionkey, value: req.body.answerkey }
    Promise.all([ game.updateEmail(answer, updatedAnswer), game.setLog(log) ])
    .then( dataArray => res.status(200).json(dataArray) )
    .catch( err => res.status(400).json( err ) )
})

router.post('/delete', async (req, res, next) => {
    let answer = [ req.session.stsKey, req.body.questionkey, req.body.oldAnswerkey]
    let log = { FK_studentToSimKey: req.session.stsKey, FK_logActionTypeKey: 3, key: req.body.questionkey, value: req.body.oldAnswerkey }
    Promise.all([ game.deleteEmail(answer), game.setLog(log) ])
    .then( dataArray => res.status(200).json(dataArray) )
    .catch( err => res.status(400).json( err ) )
})

router.post('/log-activity', ( req, res, next ) => {
    let log = { FK_studentToSimKey: req.session.stsKey, FK_logActionTypeKey: req.body.actionKey, key: req.body.objectKey, value: req.body.activityValue }
    game.setLog(log)
    .then( () => res.status(200).json({}) )
    .catch( err => res.status(400).json(err) )
})

router.post('/set-multi-log', ( req, res, next ) => {
    let log = []
    let emailArr = JSON.parse(req.body.emailKeys)
    emailArr.map(e =>{
        log.push({ FK_studentToSimKey: req.session.stsKey, FK_logActionTypeKey: 13, key: e, value: null })
    })
    
    game.setMultiLog(log)
    .then( () => res.status(200).json({}) )
    .catch( err => res.status(400).json(err) )
})

router.get('/re-entry-single', (req, res, next) => {
    res.redirect('/capsimInbox/student/dashboard')
})

router.get('/post-assessment', (req, res, next) => {
    res.redirect('/capsimInbox/student/post-assessment')
})

router.get('/complete-assessment', (req, res, next) => {
    let reEntry = req.session.isReEntry
    let postAssessment = req.session.postAssessment
    let FK_studentToSimKey = req.session.stsKey
    let versionKey = req.session.versionKey
    let simkey = req.session.simKey
    let log = { FK_studentToSimKey, FK_logActionTypeKey: 2 }
    game.setLog(log)
    .then( () => {if (!reEntry) { return gameScore.setScore( FK_studentToSimKey, versionKey ) }  })
    .then( () => {if (!reEntry) return ss.setSettings( FK_studentToSimKey, 'completed', true, 'assessment' ) } )
    .then( () => {if(req.session.isExam == 1) return sa.setAdditionalLog( simkey, FK_studentToSimKey, versionKey ) })
    .then( () => {if(req.session.isExam == 1) return modexReportEmail.sendModexScoreEmail(req, res, next) })
    // .then( () => {if(req.session.isExam == 1) return ss.setSettings( FK_studentToSimKey, 'clearedCompetencies', [], 'assessment' ) }  )
    .then( () => {if(req.session.isExam == 1) return sa.automatedClearStudentScore( simkey, FK_studentToSimKey ) })
    .then( () => {
        if(reEntry){
            res.redirect('/capsimInbox/student/dashboard')
        }else if(postAssessment){
            //studentportal router is case sensitive, so "CapsimInbox" is needed to route correctly. 
            res.redirect('/CapsimInbox/student/post-assessment')
        }else if(req.session.isExam == 1){
            res.redirect('/capsiminbox/student')
        }else{
            res.redirect('/capsiminbox/student')
        }
    } )
    .catch( err => next(err) )
})

router.get('/get-exam-score', (req, res, next) => {
    let FK_studentToSimKey = req.session.stsKey
    let versionKey = req.session.versionKey
    let data = gameScore
    .getExamScore( FK_studentToSimKey, versionKey )
    .then( (data) => res.json(data) )
})

router.get('/clear-student', (req, res, next) => {
    game.clearStudent(req.session.studentkey)
    .then( data => res.json(data) )
    .catch( err => next(err) )
})

router.get('/getReports', examInProgress, asyncWrap( async (req, res, next) => {
    const studentKey = req.session.studentkey; 
    const { simKey } = await game.getVersionData(req.session.stsKey)
    const reportJson =  await game.requestReport(studentKey, simKey);      
    res.status(200).json(reportJson); 
}))

//not sure if this function is used, but can use the one below that takes in log key instead and get rid of this one
router.get('/log-answers', (req, res, next) => {
    game.getStudentLog(req.session.stsKey, 3)
    .then( data => res.json(data) )
    .catch( err => next(err) )
})

// router.get('/log-answers', logKey, (req, res, next) => {
//     game.getStudentLogEntries(req.session.stsKey, logKey)
//     .then( data => res.json(data) )
//     .catch( err => next(err) )
// })


// doing this so we dont have to do any extra checks for getReports, make better later
router.get('/getRehearsalReports', asyncWrap( async (req, res, next) => {
    const reportJson =  await game.requestReport(0, 0);      
    res.status(200).json(reportJson); 
}))

router.get('/abc', asyncWrap( async (req, res, next) => {
    let score = await gameScore.getScore(req.session.stsKey)
    res.json(score)
}))
 
router.get('*', function(req, res, next) {
    if(req.session.isExam == 1 && req.session.examPasswordCheck != true && req.session.passwordRequired == true){
        res.redirect('/capsiminbox/student')
    }else{
        const data = {
            userData: req.session.data, 
            assetsPath: process.env.ASSETS_URL,
            versionKey: req.session.versionKey, 
            info:Info(req.session.isExam),
            isExam: req.session.isExam,
            assessmentTypeKey: constants.ASSESSMENT_TYPE_KEY.WEBAPP
        }
        const title = (req.session.isExam == 1 ? 'MODX - Assessment' : 'CapsimInbox - Assessment')
        res.render('index', { 
            layout: 'assessmentlayout', 
            // layout: 'webapplayout', 
            title: title,
            data: JSON.stringify(data) 
        })
    }
})

module.exports = router;
