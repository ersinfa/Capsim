const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const secret = 'secret';
const auth = require('../middleware/studentAuth')
const Role = require('../resources/role')

const db = require('../services/db.js')

const sr = require('../services/studentReport.js');
const sidp = require('../services/studentIDP.js');

const pd = require('../services/portalData.js');
const rd = require('../services/reportData.js');
const ss = require('../services/studentSetting.js');
const EntryQuestionnaire = require('../resources/entryQuestion')
const gs = require('../services/gameScore')

const UserFile = require('../resources/userFile')
const UserFileToUser = require('../resources/userFileToUser')
const StudentToSim = require('../resources/studentToSim')

// Refactor, please refactor this. 
const game = require('../services/gameData')
const sectionSettings = require('../services/sectionSettings')
const fileManager = require('../services/fileManager')
const lmsSetting = require('../services/lmsSetting')
const asyncWrap = require('../middleware/asyncWrap');
const sa = require('../services/studentAdmin.js')
const nodemailer = require('../lib/mailer.js');




// USER PAYMENT SERVICE - welcome from iTransact! This route needs to go before the default get '/' => auth because user doesn't have a session yet  //
router.get('/user-payment-check', asyncWrap( async ( req, res, next ) => {
  let username = req.query.username
  let simDetails = await db('Capstone').select('StudentKey', 'Sectionkey').from('Student').where({username}).first()
  //if paid, mark as paid
  if(req.query.authcode.length > 0){
    let updatedUser = await db('Capstone').update({isActive: 1, payment_made: 1}).from('commerce_student_purchases').where({studentkey: simDetails.StudentKey})
  } else {
    return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)
  }

  let studentkey = simDetails.StudentKey
  let sectionkey = simDetails.sectionKey
  let simID = req.query.simid 
  let useremail = req.query.useremail
  let firstname = req.query.firstname
 
  let stsKey = await pd.checkStudentToSim( studentkey, simID)
  
  let isNewRegistration = true
  
  let sessionData = await pd.setStudentSession(studentkey, sectionkey, stsKey, simID, isNewRegistration)
  req.session = Object.assign(req.session, sessionData)


  function notifySupport(error){
    nodeMailer.sendMail({
      from: 'support@capsim.com',
      to: 'rnd@capsim.com',
      subject: 'User error when purchasing CapsimInbox - Time Management via D2C',
      html: `<p>User had error when </p><p>Username: ${username}<br>Email: ${useremail}</p><p>${error}</p>`
    })
  }

  const html = `<p>Hi ${firstname},</p><p>Thank you for registering for <b>CapsimInbox:Time Management, </b>an immersive way to measure and develop the skills you need to make better use of your time.</p><p>Here is your Username:<b>${username}</b></p><p>To get started, visit <a>www.capsim.com/login</a></p><p>Best of luck with your future development!<br>-The Capsim Team</p>`
  const mailOptions = {
      from: 'support@capsim.com',
      to: useremail,
      subject: 'Welcome to Capsim',
      html: html
  };

  nodemailer.sendMail(mailOptions, (error, info) => {
    if(error) notifySupport(error)
  })

  const html2 = `<p>Username: ${username}<br>Email: ${useremail}</p>`
  const mailOptions2 = {
    from: 'support@capsim.com',
    to: 'marketing@capsim.com',
    subject: 'User has purchased CapsimInbox - Time Management via D2C',
    html: html2
  }

  nodemailer.sendMail(mailOptions2, (error, info) => {
    if(error) notifySupport(error)
  })

  res.redirect('/capsiminbox/student')
}))


router.get('/', asyncWrap(auth), (req, res, next) => {
  // let layout = (req.session.isExam != 1 ? 'studentlayout' : 'studentportallayout')
  
  let layout = 'studentportal'
  // let layout = (req.session.isExam != 1 ? 'studentportal' : 'studentportallayout')
  const title = (req.session.isExam == 1 ? 'MODX - Student Dashboard' : 'CapsimInbox - Student Dashboard')

  res.render('index', {
      layout: layout,
      title: title,
      data: JSON.stringify(req.data)
  })
})

router.get('/role', asyncWrap( async (req, res, next) => {
	let role = await new Role({ FK_versionKey: req.session.versionKey }).fetch()
	res.json(role)
}))

router.get('/switch', asyncWrap( async (req, res, next) => {
  let route = req.query.route;
  if (route == 'idp') res.redirect('/CapsimInbox/student/walkthrough/idpbuilder')
}))

router.get('/login', asyncWrap( async (req, res, next) => {
  let studentkey = req.query.studentkey;
  let sectionkey = req.query.key;
  let stsKey = req.query.stsKey;
  let simId = req.query.simid

  let token = crypto.createHash('md5').update(`${studentkey}${sectionkey}${secret}`).digest("hex").toUpperCase()

  if(token != req.query.attrSec && !req.session.isNewRegistration) return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)

  if(!stsKey){
    stsKey = await pd.checkStudentToSim( studentkey, simId)
  }
	
  let sessionData = await pd.setStudentSession(studentkey, sectionkey, stsKey, simId)
  req.session = Object.assign(req.session, sessionData)
  
  res.redirect('/capsiminbox/student')
}))


// Logs out from student portal
router.get('/logout', ( req, res, next ) => {
  req.session.destroy(function(err) {
    if(err) return next(err)
    res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)
  })
})

//goes back to course page
router.get('/courses', ( req, res, next ) => {
	if( !req.session.data ) return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)
	let url = `login/logincheck.cfm?studentKey=${req.session.data.studentkey}&token=${crypto.createHash('md5').update(`${req.session.data.studentkey}${process.env.APP_SECRET}`).digest("hex").toUpperCase()}`
	req.session.destroy(function(err) {
		if(err) return next(err)
		res.redirect(`http://${process.env.API_WW2_HOSTNAME}/${url}`)
	})
})

//updates session with applicable assessment data when clicking 'Take Assessment' from dashboard
router.put('/update-session', async (req, res, next) =>{
  let retVal = {}
  let getReport = req.body.toRoute == 'Report'
  let stsKey = req.body.stsKey
  let { versionKey } = await pd.getVersion( stsKey )
  req.session.stsKey = stsKey
  req.session.versionKey = versionKey
  retVal.selectedStsKey = stsKey

  //need to get updated reports(via all assessments) from DB because construct and competency data can be missing in certain scenarios, 
  //such as completion of post_assesstment report (contructs) and completion of inbox EDM(competencies)
  if(getReport){
    retVal.allAssessments = await pd.getAllAssessments( req.session.studentkey, req.session.sectionkey)
  }

  res.json(retVal)
})

router.post('/self-assessment', function(req, res, next) {
  let skills = JSON.parse(req.body.skills).map( skill => {
    return {
      FK_studentToSimKey: req.session.stsKey,
      FK_skillKey: skill.skillKey,
      points: skill.points
    }
  })
  pd.setSelfSkill(skills, req.session.stsKey )
  .then( () => res.status(200).send() )
  .catch( err => res.status(400).send(err) )
});

router.get('/self-assessment', function(req, res, next) {
  pd.getSelfSkill(req.session.stsKey )
  .then( data => res.status(200).send(data) )
  .catch( err => res.status(400).send(err) )
});

router.get('/getReportData', function(req, res, next) {
  sr.buildReport( req.session.stsKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
});

router.get('/getIDPData', asyncWrap( async (req, res, next) => {
  //let data = await sidp.buildIDP( req.query.stsKey, req.query.versionKey, req.query.isExam )
  let data = await sidp.buildIDP( req.session.stsKey, req.session.versionKey, req.session.isExam)
  res.status(200).json(data)
}))

router.get('/getStudentGoals', function(req, res, next) {
  sidp.getStudentGoals( req.session.stsKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
});

// Using POST instead of GET to fix IE related bug
router.post('/getStudentGoals', function(req, res, next) {
  sidp.getStudentGoals( req.session.stsKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
});

router.post('/setStudentGoal', function(req, res, next) {
  sidp.setStudentGoal( req.session.stsKey, req.body.data )
  .then( studentGoalKey => res.status(200).json({ studentGoalKey }) )
  .catch( err => res.status(400).send(err) )

});

 // Additional password check for University of Florida
router.post('/examPasswordCheck', asyncWrap( async (req, res, next) => {
  const sessionData = {
    localClassStartDate: req.session.data.startDateTime, 
    localClassEndDate: req.session.data.endDateTime,
    timer: req.session.data.timer,
    simKey: req.session.simKey,
    sectionkey: req.session.sectionkey,
    versionKey: req.session.versionKey
  }
  const settings = await sectionSettings.getExamSettings(sessionData)

  let studentSettings = await ss.getSettings(req.session.stsKey)
  studentSettings = (studentSettings !== undefined ) ? JSON.parse(studentSettings.settingJSON) : {}

  if( typeof studentSettings.assessment != 'undefined' 
    && typeof studentSettings.assessment.password != 'undefined'
    && typeof studentSettings.assessment.password != ''
    && req.body.passwordField == studentSettings.assessment.password ){
      req.session.examPasswordCheck = true
      res.status(200).send(true)
  }else if( req.body.passwordField == settings.password){
    req.session.examPasswordCheck = true
    res.status(200).send(true)
  }else{
    res.status(400).send(false)
  }
}))

router.put('/update-goal', function( req, res, next ) {
    sidp.updateStudentGoal( req.session.stsKey, req.body.studentGoalKey, req.body.goal )
    .then( data => res.status(200).json(data) )
    .catch( err => res.send(err) )
})

router.get('/getSkillsInfo', function(req, res, next) {
  let FK_MeasurementTypeKey = 1
  let params = {
    "where":{
      "FK_versionKey": req.session.versionKey
    },
    "skillsObj":true
  }
  rd.getMeasurement( FK_MeasurementTypeKey, params )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
});

router.get('/getSettings', asyncWrap( async (req, res, next) => {
  let studentToSimKey = req.session.stsKey
  try {
    if(req.session.isExam == 1) await sa.updateStudentTimer(req.session.simKey, req.session.stsKey, req.session.versionKey )

    let studentSettings = await ss.getSettings(studentToSimKey)
    studentSettings = (studentSettings !== undefined ) ? JSON.parse(studentSettings.settingJSON) : {}
    let webappData = (studentSettings.webapp !== undefined ) ? studentSettings.webapp.data : {}
    // Student doest not share the same session data as prof, refactor later
    const sessionData = {
      localClassStartDate: req.session.data.startDateTime, 
      localClassEndDate: req.session.data.endDateTime,
      timer: req.session.data.timer,
      sectionkey: req.session.sectionkey,
      simKey: req.session.simKey,
      versionKey: req.session.versionKey
    }

    const settings = await sectionSettings.getExamSettings(sessionData)

    let passwordRequired = ( (typeof settings.password != 'undefined' && settings.password != '' ) 
      || ( typeof studentSettings.assessment != 'undefined' && typeof studentSettings.assessment.password != 'undefined' && typeof studentSettings.assessment.password != '' ) )
    
    req.session.passwordRequired = passwordRequired

    if (typeof studentSettings.assessment != 'undefined' && typeof studentSettings.assessment.timer != 'undefined' && studentSettings.assessment.timer > 0){
       settings.time = studentSettings.assessment.timer
    }
    const dashboardAccess = settings.dashboardAccess 
    const result  = Object.assign({}, { additionalTime: settings.time, simTitle: settings.simTitle, passwordRequired: req.session.passwordRequired, dashboardAccess }, webappData)
    res.status(200).json(result)
  } catch (error) {
    next (error)
  }
}))


router.get('/getStudentAccess', asyncWrap( async (req, res, next) => {
console.log("in get student access")
  try { 
    // Student doest not share the same session data as prof, refactor later
    const sessionData = {
      localClassStartDate: req.session.data.startDateTime, 
      localClassEndDate: req.session.data.endDateTime,
      sectionkey: req.session.sectionkey,
      simKey: req.session.simKey,
      versionKey: req.session.versionKey
    }
		const settings = await sectionSettings.getExamSettings(sessionData)
    const dashboardAccess = settings.dashboardAccess

    res.status(200).json({
      dashboardAccess
    })
  } catch (error) {
    next(error)
  }
}))

router.post('/setSettings', function(req, res, next) {

  let studentToSimKey = req.session.stsKey
  let key = req.body.key
  let value = req.body.value
  let configName = req.body.configName

  ss.setSettings( studentToSimKey, key, value, configName )
  .then( ret => res.status(200).send() )
  .catch( err => res.status(400).send(err) )
});

router.get('/getQuestionnaire', asyncWrap( async (req, res, next) => {
  const questions = await EntryQuestionnaire.where({ FK_versionKey: req.session.versionKey }).fetchAll({ withRelated: 'entryAnswers' })
  res.json(questions)
}))

router.get('/getQuestionnaireAnswers', asyncWrap( async (req, res, next) => {
  pd.getQuestionnaireAnswers(req.session.stsKey )
  .then( data => res.status(200).send(data) )
  .catch( err => res.status(400).send(err) )
}))

router.post('/setQuestionnaire', function(req, res, next) {
  let answers = JSON.parse(req.body.answers).map( answer => {
    return {
      FK_studentToSimKey: req.session.stsKey,
      FK_questionKey: answer.questionKey,
      FK_answerKey: answer.answerKey
    }
  })

  pd.setQuestionnaire(answers, req.session.stsKey )
  .then( () => ss.setSettings( req.session.stsKey, 'completed', true, 'questionnaire' ) )
  .then( () => res.status(200).send() )
  .catch( err => res.status(400).send(err) )

});

router.post('/setPostAssessmentAnswers', asyncWrap(async (req, res, next) => {
  let answers = JSON.parse(req.body.answers)
  let answersArr = []
  for(let a in answers){
    answersArr.push({
      answer: answers[a],
      FK_questionKey: a,
      FK_studentToSimKey: req.session.stsKey
    })
  }

  pd.setPostAssessmentAnswers(answersArr, req.session.stsKey )
  //.then( () => ss.setSettings( req.session.stsKey, 'completed', true, 'postAssessment' )  )
  .then( (data) => res.status(200).send(data) )
  .catch( err => res.status(400).send(err) )

}));

router.put('/update-account', (req, res, next) => {
  let updateData = {
    email: req.body.email,
    phone: req.body.phone,
    FirstName: req.body.firstname,
    LastName: req.body.lastname
  }
  pd.updateStudentAccount( req.session.studentkey, updateData )
  .then( () => res.status(200).send() )
  .catch( err => res.status(400).send(err) )
})

router.put('/update-password', asyncWrap(async (req, res, next) => {
  let studentInfo         = await pd.getStudentAccountInfo( req.session.studentkey )
  let currentPassword     = makeHash( req.body.currentPassword, studentInfo.salt )

  if(currentPassword === studentInfo.password){
    let updateData = {
      password: makeHash( req.body.newPassword, studentInfo.salt )
      ,hint : req.body.hint
    }
    pd.updateStudentAccount( req.session.studentkey, updateData )
    .then( () => res.status(200).send() )
    .catch( err => res.status(400).send(err) )
  }else{
    res.status(401).send()
  }

  function makeHash( password, salt ){
    password = password.toLowerCase()
    let passwordHash = crypto.createHash('sha512').update(`${password}${salt}`).digest("hex").toUpperCase()
    for (let i = 0; i < 124; i++){
      passwordHash = crypto.createHash('sha512').update(`${passwordHash}${salt}`).digest("hex").toUpperCase()
    }
    return passwordHash
  }
}));

router.get('/getAccount', function(req, res, next) {
  pd.getStudentAccountInfo( req.session.studentkey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
});

router.put('/advance-cycle', function(req, res, next) {
  game.advanceCycle( req.body.FK_studentToSimKey )
  .then(() => res.status(200) )
  .catch( err => res.send(err) )
});

router.post('/set-cycle', asyncWrap(async (req, res, next) => {
  let cycle = await game.getCycle( req.body.FK_studentToSimKey ) 
  if(!cycle) {
    game.setCycle( req.body.FK_studentToSimKey )
    .then(() => res.status(200) )
    .catch( err => res.send(err) )
  } else {
    res.status(304).send()
  }
}));

// ===============================
// ======= For debugging =========
// ===============================
const dd = require('../services/debugData.js');

// recalculates and update all student scores
router.get('/topSecret123DoNotRunTHisURL/:versionKey', function(req, res, next) {
  if(req.query.ultra == "password"){
    dd.recalculateScoreAll(req.params.versionKey)
    .then( ret =>  res.status(200).json(ret)  )
    .catch( err => res.send(err) )
   }else{
    res.send()
  }
});

router.get('/debugGetSetScoreAll', function(req, res, next) {
  dd.getInboxScoreAll()
  .then( data => {
    res.status(200).json(data)
  } )
  .catch( err => res.send(err) )
});

router.get('/debugGetScoreAll', function(req, res, next) {
  dd.buildScoreAll()
  .then( data => {
    res.status(200).json(data)
  } )
  .catch( err => res.send(err) )
});

router.get('/debugGetLog', function(req, res, next) {
  dd.buildLogAll()
  .then( data => {
    let switchVal = ''
    if( typeof req.query.log != 'undefined')
      switchVal = req.query.log.toLowerCase()

    switch(switchVal) {
      case 'submitanswer':
          res.status(200).json(data.submitAnswer)
          break;
      case 'openemail':
          res.status(200).json(data.openEmail)
          break;
      case 'openmessage':
          res.status(200).json(data.openMessage)
          break;
      case 'openfile':
          res.status(200).json(data.openFile)
          break;
      case 'clickimportant':
          res.status(200).json(data.clickImportant)
          break;
      case 'selfassessment':
          res.status(200).json(data.selfAssessment)
          break;
      default:
          res.status(200).json(data)
    }
  } )
  .catch( err => res.send(err) )
});

router.get('/getQuestionInfo', function(req, res, next) {
  dd.buildSimulationData2()
  .then( data => res.status(200).json(data))
  .catch( err => res.send(err) )
});

router.get('/set-score', asyncWrap( async (req, res, next) => {
  let score = await gs.updateScore(req.session.stsKey, req.session.versionKey)
  res.json(score)
}))

router.get('/get-score', asyncWrap( async (req, res, next) => {
  let score = await gs.getScore(req.session.stsKey, req.session.versionKey)
  res.json(score)
}))

//THIS IS FOR DEBUGGING/VALIDATING ONLY
router.get('/get-z-score', asyncWrap( async (req, res, next) => {
  const answerObj = await rd.getConstructs(req.session.stsKey)
  res.status(200).json(answerObj)
}))

// -------------Routes for Files ---------------------//
router.get('/all-files', asyncWrap( async ( req, res ) => {
  const allFiles = await StudentToSim.where({ studentToSimKey: req.session.stsKey }).fetchAll({withRelated: ['files', 'files.fileStatus']})
  res.json(allFiles)
}))

router.post('/upload-file', asyncWrap( async ( req, res, next ) => {

  const fileFormat = req.body.fileFormat

  const file = {
      displayName: req.body.displayName,
      FK_fileTypeKey: req.body.FK_fileTypeKey,
      FK_userTypeKey: req.body.FK_userTypeKey,
      FK_fileStatusKey: req.body.FK_fileStatusKey,
      FK_cycleKey: req.body.FK_cycleKey
  }
 
  const fileName = req.body.fileName || await fileManager.putFile(req.body.file, fileFormat)
  
  const newFile = await new UserFile(Object.assign(file, { fileName })).save()
  
  // TODO: move this guys out so we could reuse this post method
  const fileToUser = {
      FK_userFileKey: newFile.id, 
      FK_studentToSimKey: req.session.stsKey
  }
  const newUserFileToUser = await new UserFileToUser(Object.assign(fileToUser)).save()
  res.json(newFile)
}))

router.delete('/delete-file/:fileKey', asyncWrap( async ( req, res, next ) => {
  const file = await UserFile.forge({userFileKey: req.params.fileKey}).fetch()

  await fileManager.deleteFile(`${file.get('fileName')}`)

  const userToFile = await UserFileToUser.where({FK_userFileKey: req.params.fileKey}).destroy()
  let deletedFile = await file.destroy()
  res.json(deletedFile)
}))





// ------------------ DEFAULT ROUTE HANDLING FOR SPA ------------------ //
router.get('*', asyncWrap(auth), (req, res, next) => {
  // let layout = (req.session.isExam != 1) ? 'studentlayout' : 'studentportallayout'
  let layout = 'studentportal'
  // let layout = (req.session.isExam != 1) ? 'studentportal' : 'studentportallayout'
  const title = (req.session.isExam == 1 ? 'MODX - Student Dashboard' : 'CapsimInbox - Student Dashboard')

  res.render('index', {
      layout: layout,
      title: title,
      data: JSON.stringify(req.data)
  })
})

module.exports = router;
