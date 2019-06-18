const secret = 'secret';
const express = require('express');
const router = express.Router();
const db = require('../services/db.js')
const crypto = require('crypto')
const json2csv = require('json2csv')
const professorAuth = require('../middleware/professorAuth')
const pd = require('../services/portalData.js')
const pr = require('../services/professorReport.js')
const sr = require('../services/studentReport.js')
const Skill = require('../resources/skill')
const UserFile = require('../resources/userFile.js')
const sectionSettings = require('../services/sectionSettings')
const studentSettings = require('../services/studentSetting')
const professorSettings = require('../services/professorSetting')
const lmsSetting = require('../services/lmsSetting')
const { camelCase } = require('lodash')
const rd = require('../services/reportData')
const asyncWrap = require('../middleware/asyncWrap');
const Competency = require('../resources/competency')
const sa = require('../services/studentAdmin.js')
const editExam = require('../services/editExam.js')
const constants = require('../services/constants.js')

router.get('/', asyncWrap(professorAuth), (req, res) => {
    const title = (req.session.data.isExam == 1 ? 'MODX - Professor Dashboard' : 'CapsimInbox - Professor Dashboard')

	res.render('index', {
		layout: 'professorlayout',
		title: title,
		data: JSON.stringify(req.session.data)
	})
})

router.get('/login', asyncWrap( async (req, res) => {

	const professorkey = req.query.professorkey
	const sectionkey = req.query.key
	const simKey = req.query.simkey
	
	const token = crypto.createHash('md5').update(`${professorkey}${sectionkey}${secret}`).digest("hex").toUpperCase()

	// If token is not equal to attrSec sendt by coldfusion user is redirected
	// if( token !== req.query.attrSec ) return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)

	const professorData = await pd.getProfessorInfo( professorkey )
	const courseInfo = await pd.getCourseInfo(simKey)
	const versionConfig = await pd.getVersionConfig(simKey)

	req.session.data = {
		simKey,
		professorkey,
		sectionkey
	}

	Object.assign(req.session.data, professorData, courseInfo[0], versionConfig)
	res.redirect('/CapsimInbox/professor')
}))

// Logs out from student portal
router.get('/logout', ( req, res, next ) => {
	req.session.destroy(function(err) {
		if(err) return next(err)
		res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)
	})
})

router.get('/getIndustryRoster', function(req, res, next) {
	pd.getIndustryRoster( req.session.data.sectionkey )
	.then( data => { res.status(200).json(data) })
	.catch( err => next(err) )
})

router.get('/getSkillScores', asyncWrap( async (req, res, next) => {
	let { report, averages, examsCompleted, classAverage } = await pr.getSkillScoreReport( req.session.data )
	res.status(200).json({report, averages, examsCompleted, classAverage } )
}))

router.get('/getLearningGoals', asyncWrap( async (req, res, next) => {
	let report = await pr.getAolReport( req.session.data )
	res.status(200).json({ learningGoalReport: report })
}))


router.get('/getSkillAverages', asyncWrap( async (req, res, next) => {
	let { report, examsCompleted } = await pr.getAveragesReport( req.session.data )
	res.status(200).json({ report, examsCompleted })
}))

router.get('/getProfessorResources', asyncWrap( async (req, res, next) => {
	const retVal = await pd.getProfessorResources( req.session.data.versionKey )
	res.status(200).json(retVal)
}))

router.get('/getCompetencies', asyncWrap( async (req, res, next) => {
	const competencies = await Competency.where({ FK_versionKey: req.session.data.versionKey }).fetchAll()
	res.status(200).json(competencies)
}))

router.get('/getStudentReport', asyncWrap( async (req, res, next) => {
	const retVal = await sa.getStudentReport( req.query.stsKey, req.session.data.versionKey, req.session.data.sectionkey )
	res.status(200).json(retVal)
}))

router.get('/getAllAttemptsScoreOverviewReport', asyncWrap( async (req, res, next) => {
	let allAttemptsScoreOverviewReport  = await pr.getAllAttemptsScoreOverviewReport( req.session.data )
	res.status(200).json(allAttemptsScoreOverviewReport )
}))

router.get('/getAllAttemptsConceptMatrixReport', asyncWrap( async (req, res, next) => {
	let allAttemptsConceptMatrixReport  = await pr.getAllAttemptsConceptMatrixReport( req.session.data )
	res.status(200).json(allAttemptsConceptMatrixReport )
}))

router.get('/getSkills', asyncWrap( async (req, res, next) => {
	let skills  = await pr.getSkills( req.session.data )
	res.status(200).json(skills)
}))

router.get('/getScoringAutomation', asyncWrap( async (req, res, next) => {
	const simKey = req.session.data.simKey
	let scoringAutomationSettings  = await sectionSettings.getSettingsByConfigName(simKey,'scoringAutomation')
	
	res.status(200).json(scoringAutomationSettings)
}))

router.post('/setScoringAutomation', asyncWrap( async (req, res, next) => {
	let data = JSON.parse(req.body.data)
	const simKey = req.session.data.simKey
	await sectionSettings.setSettings(simKey, 'competenciesToClear', data.competenciesToClear, 'scoringAutomation' )
	await sectionSettings.setSettings(simKey, 'scoreBenchmark', data.scoreBenchmark, 'scoringAutomation' )
	await sectionSettings.setSettings(simKey, 'emailScoringReportToStudents', data.emailScoringReportToStudents, 'scoringAutomation' )
	await sectionSettings.setSettings(simKey, 'timePerSubjectArea', data.timePerSubjectArea, 'scoringAutomation' )
}))


router.delete('/clearStudentScore', asyncWrap( async (req, res, next) => {
	await sa.clearStudentScore( req.body.stsKey, req.body.competenciesToClear )
	let FK_professorKey = req.session.data.professorkey
	let FK_logActionTypeKey = 8
	let key = req.body.stsKey
	let value =  JSON.stringify({clearedCompetencies:req.body.competenciesToClear})
	await sa.setProfessorLog({FK_professorKey,FK_logActionTypeKey,key,value})
	res.status(200).send()
}))

router.post('/restoreStudentScore', asyncWrap( async (req, res, next) => {
	let retVal= await sa.undoClearStudentScore( req.body.stsKey )
	let FK_professorKey = req.session.data.professorkey
	let FK_logActionTypeKey = 9
	let key = req.body.stsKey
	if(retVal.status == 200){
		await sa.setProfessorLog({FK_professorKey,FK_logActionTypeKey,key})
	}
	res.status(200).send(retVal)
}))

router.get('/getProfessorLog',function(req, res, next) {
	sa.getProfessorLog(req.session.data.professorkey,req.session.data.sectionkey)
	.then( data => { res.status(200).json(data) })
	.catch( err => next(err) )
})

router.get('/skill-scores-csv', asyncWrap( async (req, res) =>  {
	let { report, skills } = await pr.getSkillScoreReport( req.session.data )
	let fields = (req.session.data.isExam == 1)? ['name', 'overall'] :['name', 'overall', 'selfAwareness']
	let fieldNames = (req.session.data.isExam == 1)? ['Name', 'Overall Score'] : ['Name', 'Overall Score', 'Self-Awareness Score']

	skills.forEach( skill => {
		fields.push(camelCase(skill.get('name')))
		fieldNames.push(skill.get('name'))
	})

	res.writeHead(200, {
		'Content-Type': 'application/csv',
		'Content-Disposition': `filename=skillScores.csv`
	});
	res.end(json2csv({report, fields, fieldNames}))
}))

router.get('/sr', function(req, res, next) {
	// sr.buildReport( 1488092 )
	sr.buildReport( 1488046 )
	.then( data => res.status(200).json(data) )
	.catch( err => next(err) )
});

router.get('/courses', ( req, res, next ) => {

	if( !req.session.data ) return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)

	let url = `login/logincheck.cfm?profKey=${req.session.data.professorkey}&token=${crypto.createHash('md5').update(`${req.session.data.professorkey}${process.env.APP_SECRET}`).digest("hex").toUpperCase()}`
	req.session.destroy(function(err) {
		if(err) return next(err)
		res.redirect(`http://${process.env.API_WW2_HOSTNAME}/${url}`)
	})
})

router.put('/update-section', (req, res, next) => {
	let key = req.body.key
	let value = req.body.value
	pd.updateSection( key, value, req.session.data.sectionkey )
	.then( data => res.status(200).json(data) )
	.catch( err => next(err) )
})

router.put('/update-raw-section', (req, res, next) => {
	try {
		let section = req.body
		pd.updateCourseSettings(section, req.session.data.simKey )
		.then( data => res.status(200).json(data) )
		.catch( err => next(err) )
	} catch (error) {
		console.log(error)
	}
})

router.put('/update-results-raw-section', (req, res, next) => {
	try {
		let section = req.body
		pd.updateResultsavailable2Raw(section, req.session.data.simKey )
		.then( data => res.status(200).json(data) )
		.catch( err => next(err) )
	} catch (error) {
		console.log(error)
	}
})

// Fix copy & paste functions once we have time 
router.put('/update-student-settings/:stsKey', (req, res) => {
	studentSettings.setSettings(  req.params.stsKey, 'data', req.body, 'webapp' )
	.then( () => res.status(200).send() )
	.catch( err => next(err) )
})

router.put('/update-professor-settings/', (req, res) => {
	professorSettings.setSettings(req.session.data.professorkey, req.body.key, req.body.value, req.body.configName)
	.then( () => res.status(200).send() )
	.catch( err => next(err) )
})

router.put('/update-sim', (req, res, next) => {

	let key = req.body.key
	let value = req.body.value

	pd.updateSim( key, value, req.session.data.sectionkey )
	.then( data => res.status(200).json(data) )
	.catch( err => next(err) )

})

router.get('/template-manager', asyncWrap( async ( req, res ) => {

	let sectionKeys = [
		'sectionTypeKey',
		'sectionLevelKey',
		'dayofWeek',
		'activeKey',
		'competitionTypeKey',
		'distributionKey',
		'ClonedFrom',
		'paramcustomKey',
		'paramTypekey',
		'teamassignment',
		'editionKey'
	]

	let shoppingCartKeys = [
		'productKey',
		'Price',
		'PricedFree',
		'ProductCategoryKey',
		'Distribution as shippingModeKey',
		'Distribution'
	]

	let Section = await db('Capstone').select(sectionKeys).from('Section').where({ sectionKey: req.session.data.sectionkey }).first()
	let SectionShoppingCart = await db('Capstone').select(shoppingCartKeys).from('SectionShoppingCart').where({ sectionKey: req.session.data.sectionkey })

	let courseTemplate = {
		section: Section,
		SectionShoppingCart
	}

	res.render('templateManager', { layout: 'professorlayout', courseTemplate: JSON.stringify(courseTemplate) })
}))

router.post('/save-course-template', asyncWrap( async ( req, res, next ) => {
	let data = JSON.parse(req.body.data)
	let section = {}
	Object.keys( data.courseTemplate.section ).forEach( key => section[key.toUpperCase()] = data.courseTemplate.section[key] )
	section.COMPETITIONTYPEKEY = 2
	let courseTemplate = {
		SectionShoppingCart: data.courseTemplate.SectionShoppingCart.map( elm => {
			let element = {}
			Object.keys( elm ).forEach( key => element[key.toUpperCase()] = elm[key] )
			return element
		}),
		section
	}

	db('Capsim').insert({ name: data.name, description: data.name, tableStructureJson: JSON.stringify(courseTemplate) }).into('tem_template')
	.then( () => res.status(200).send() )
	.catch( err => next(err) )

}))


const sidp = require('../services/studentIDP.js');
router.get('/getStudentGoals', asyncWrap( async (req, res) => {
	sidp.getStudentGoals( req.query.stsKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))

router.get('/getStudentInfo', asyncWrap( async (req, res) => {
	pd.getStudentInfo( req.query.stsKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))

router.get('/getSectionSettings', asyncWrap( async (req, res) => {
	const result = await sectionSettings.getExamSettings(req.session.data)
	res.status(200).json(result); 
}))

router.put('/update-section-settings', asyncWrap( async (req, res, next) => {
	let settings = req.body
	let sectionkey = req.session.data.sectionkey
	let simKey = req.session.data.simKey
	if (settings.dashboardAccess !== undefined ) {
		// call SQL to convert local time to EST time
		let estTime = await pd.convertLocalToEST(settings.dashboardAccess.accessStartDate, settings.dashboardAccess.accessEndDate, sectionkey)
		settings.dashboardAccess = {
			accessStartDate: estTime.startDateTime,
			accessEndDate: estTime.endDateTime
		}
	}
	sectionSettings.setSettings(simKey, 'data', settings, 'exam' )
	.then( () => res.status(200).send() )
	.catch( err => next(err))
}))

// Fix copy & paste functions once we have time 
router.get('/getStudentSettings', asyncWrap( async (req, res, next) => {
	try {
		let data = await studentSettings.getSettings(req.query.stsKey)
		data = (data !== undefined ) ? JSON.parse(data.settingJSON) : {}
		data = (data.webapp !== undefined ) ? data.webapp.data : {}
		
		const settings = await sectionSettings.getExamSettings(req.session.data)
		const result  = Object.assign({}, { additionalTime: settings.time }, data)
		res.status(200).json(result); 
	} catch (error) {
		next (error)
	}
}))

router.get('/getStudentSettingsCorrectOne', asyncWrap( async (req, res, next) => {
	let data = await studentSettings.getSettings(req.query.stsKey)
	data = (data !== undefined ) ? JSON.parse(data.settingJSON) : {}
  res.status(200).json(data) 
}))

// Fix copy & paste functions once we have time 
router.get('/getProfessorSettings', asyncWrap( async (req, res, next) => {
	try {
		// FIX, refactor the config extraction!!!!, when we have time!!!
		let data = await professorSettings.getSettings(req.session.data.professorkey)
		data = (data !== undefined ) ? JSON.parse(data.settingJSON) : { survey: {} }
		res.status(200).json(data); 
	} catch (error) {
		next (error)
	}
}))


router.get('/getVersionQuestionGroups', asyncWrap( async (req, res) => {
	editExam.getVersionQuestionGroups( req.session.data.versionKey)
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))

router.get('/getQuestionGroupToSim', asyncWrap( async (req, res) => {
	editExam.getQuestionGroupToSim( req.session.data.simKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))
router.get('/hasStudentsStartedExam', asyncWrap( async (req, res) => {
	editExam.hasStudentsStartedExam( req.session.data.simKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))

router.get('/getExamQuestions', asyncWrap( async (req, res) => {
	editExam.getExamQuestions( req.session.data.versionKey, req.session.data.simKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))

router.put('/updateSelectedQuestionGroups', asyncWrap( async (req, res) => {
	editExam.updateQuestionGroupsToSim( req.session.data.simKey, req.body.selectedQuestionGroup )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))

router.post('/generateStudentsPassword', asyncWrap( async (req, res) => {
	editExam.generateStudentsPassword( req.session.data.simKey )
  .then( data => res.status(200).json(data) )
  .catch( err => res.send(err) )
}))

router.post('/setStudentSettings', function(req, res, next) {

  let studentToSimKey = req.body.stsKey
  let key = req.body.key
  let value = req.body.value
  let configName = req.body.configName

  studentSettings.setSettings( studentToSimKey, key, value, configName )
  .then( ret => res.status(200).send() )
  .catch( err => res.status(400).send(err) )
});

router.post('/add-lms-student-time-multiplier', function(req, res, next) {
		let FK_lmsUserID = req.body.FK_lmsUserID
		let timeMultiplier = Number(req.body.timeMultiplier)
		let FK_simKey = req.session.data.simKey
	
		lmsSetting.setLmsUserToTimeMultiplier({FK_lmsUserID,timeMultiplier,FK_simKey})
		.then( data => res.status(200).send() )
		.catch( err => res.status(400).send(err) )
	});

	router.get('/get-lms-student-time-multiplier', function(req, res, next) {

		let FK_simKey = req.session.data.simKey
		lmsSetting.getLmsUserToTimeMultiplier(FK_simKey)
		.then( data => res.status(200).json(data) )
		.catch( err => res.status(400).send(err) )
});

router.delete('/remove-lms-student-time-multiplier', function(req, res, next) {
		let FK_lmsUserID = req.body.FK_lmsUserID
		let timeMultiplier = Number(req.body.timeMultiplier)
		let FK_simKey = req.session.data.simKey

		lmsSetting.removeLmsUserToTimeMultiplier({FK_simKey, FK_lmsUserID})
		.then( data => res.status(200).send() )
		.catch( err => res.status(400).send(err) )
});

router.get('/getIsStudentsNeedsToBeProcessed',function(req, res, next) {
	const FK_simKey = req.session.data.simKey
	const versionKey = req.session.data.versionKey
	sa.getIsStudentsNeedsToBeProcessed(FK_simKey,versionKey)
	.then( data => { res.status(200).json(data) })
	.catch( err => next(err) )
})

router.post('/processStudents',function(req, res, next) {
	const FK_simKey = req.session.data.simKey
	const versionKey = req.session.data.versionKey
	sa.processStudents(FK_simKey,versionKey)
	.then( data => { res.status(200).json(data) })
	.catch( err => next(err) )
})

router.get('/get-is-lms-sim', function(req, res, next) {
	let FK_simKey = req.session.data.simKey
	lmsSetting.isLmsSim(FK_simKey)
	.then( data => res.status(200).json(data) )
	.catch( err => res.status(400).send(err) )
});
// ===============================
// ======= Helpers =========
// ===============================

router.get('/skills/:format?', asyncWrap( async (req, res) => {
	
	let versionKey =  req.session.data.versionKey
	let simKey =  req.session.data.simKey
	let simQuestionGroupArr = (versionKey == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
	: await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , versionKey).map(row => row.questionGroupKey)
	const simMeasurementKeys       = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
	const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
	let skills = {}

	if (req.query.format == 'map'){
		let params = {
			"whereIn":{
					"column": "skillKey",
					"values": simSkillKeyArr
			},
			"skillsObj": true
	}
		skills = await rd.getMeasurement(constants.MEASUREMENT_TYPE_KEY.SKILL, params)
	}
	else {
		skills = await Skill.where('skillKey','in', simSkillKeyArr ).fetchAll()
	}
	res.json(skills)
}))

router.get('/countryList', asyncWrap( async (req, res) => {
	let countryList = await pd.getCountryList()
	res.json(countryList)
}))

router.post('/regionList', asyncWrap( async (req, res) => {
	let country = req.body.country
	let regionList = await pd.getRegionList(country)
	res.json(regionList)
}))

router.post('/tzDetails', asyncWrap( async (req, res) => {
	let worldtimeKey = req.body.worldtimeKey
	let tz = await pd.getTZDataForLocation(worldtimeKey)
	res.json(tz)
}))

router.post('/countryDetails', asyncWrap( async (req, res) => {
	let worldtimeKey = req.body.worldtimeKey
	let countryInfo = await pd.getCountryDetails(worldtimeKey)
	res.json(countryInfo)
}))

router.post('/setgrade', asyncWrap( async (req, res) => {
	let FK_studentToSimKey = req.body.stsKey
	let FK_questionKey = req.body.questionKey
	let grade = req.body.grade
	let gradeEntered = await pd.updateStudentGrade(FK_studentToSimKey, FK_questionKey, grade )
	res.json(gradeEntered)
}))

router.get('*', asyncWrap(professorAuth), (req, res) => {
    const title = (req.session.data.isExam == 1 ? 'MODX - Professor Dashboard' : 'CapsimInbox - Professor Dashboard')

	res.render('index', {
		layout: 'professorlayout',
		title: title,
		data: JSON.stringify(req.session.data)
	})
})

router.put('/update-file/:userFileKey', asyncWrap( async (req, res) => {
	const file = await new UserFile(req.params).save(req.body, {patch: true})
    res.json(file)
}))


module.exports = router;
