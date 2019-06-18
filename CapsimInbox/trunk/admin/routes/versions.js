const express = require('express')
const router = express.Router()
const Version = require('../../resources/version')
const asyncWrap = require('../../middleware/asyncWrap')
const versionLock = require('../middlewares/version').versionLock
const crypto = require('crypto'), algorithm = 'aes-256-ctr', password = 'd6F3Efeq'
const fileManager = require('../../services/fileManager')
const Departments = require('../../resources/departments')
const Editors = require('../../resources/editors')
const Dtv = require('../../resources/departmentToVersion')
const Ntv = require('../../resources/nameToVersion')

function encrypt(text){
  const cipher = crypto.createCipher(algorithm,password)
  let crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

router.get('/', asyncWrap( async (req, res, next ) => {
	let allVersions = await Version.fetchAll({ withRelated: ['skills', 'editor', 'department'] })
	res.status(200).json(allVersions)
}))

router.get('/:key/questions', asyncWrap( async (req, res, next ) => {
	let version = await Version.get(req.params.key)
	res.status(200).json(version)
}))

router.get('/editorNames', asyncWrap( async ( req, res, next ) => {
    let names = await Editors.fetchAll()
    res.status(200).json(names)
}))

router.get('/editorDepts', asyncWrap( async ( req, res, next ) => {
    let depts = await Departments.fetchAll()
    res.status(200).json(depts)
}))

router.post('/editorDepts/:versionKey', asyncWrap( async ( req, res, next ) => {
	let versionKey = req.params.versionKey
	let depts = await Dtv.where({FK_versionKey: versionKey}).fetch()
	let record
	if(depts){
		depts.where({FK_versionKey: versionKey}).save({FK_editorDeptKey: req.body.FK_editorDeptKey}, {patch: true})
		res.status(200).json(depts)
	} else (
		record = await new Dtv({FK_versionKey: versionKey, FK_editorDeptKey: req.body.FK_editorDeptKey}).save()
	)
    res.status(200).json(record)
}))

router.post('/editorNames/:versionKey', asyncWrap( async ( req, res, next ) => {
	let versionKey = req.params.versionKey
	let names = await Ntv.where({FK_versionKey: versionKey}).fetch()
	let record
	if(names){
		names.where({FK_versionKey: versionKey}).save({FK_editorNameKey: req.body.FK_editorNameKey}, {patch: true})
		res.status(200).json(names)
	} else (
		record = await new Ntv({FK_versionKey: versionKey, FK_editorNameKey: req.body.FK_editorNameKey}).save()
	)
    res.status(200).json(record)
}))


router.get('/:key', asyncWrap( async (req, res, next ) => {
	let version = await Version.where({versionKey: req.params.key})
	.fetch({withRelated: ['questions.questionToVersion', 'skills.answers', 'authors.questions', 'folders.fileToFileFolder.file', 'competencies.answers','learningGoals.answers', 'questionGroup', 'editorName', 'editorDept', 'construct', 'postAssessmentQuestion']})
	req.session.workingVersionKey = version.get('versionKey')
	const demoUrl = `${req.hostname}/capsiminbox/demo/welcome?qv=${encrypt('secret.'+req.params.key)}`
	res.status(200).json(Object.assign(version.toJSON(), { demoUrl }))
}))

router.get('/duplicate/:versionKey', asyncWrap( async (req, res, next) => {
	let newVersion = await Version.where(req.params).duplicate()
    res.status(200).json(newVersion)
}))

router.post('/', versionLock, asyncWrap( async( req, res, next ) => {
	let version = await new Version(req.body).save()
	res.status(200).json(version)
}))

router.post('/toggle-active', asyncWrap( async( req, res, next ) => {
	if(req.session.passport.user.role == "R&D") {
		const versionKey = req.body.versionKey
		const updatedVersion = await new Version({versionKey}).save({isActive:req.body.isActive},{patch: true})
		res.json(updatedVersion)
	} else res.status(400).json({ message: 'Not Authorized' })
}))

router.put('/:key', versionLock, asyncWrap( async (req, res, next ) => {

	const versionKey = req.params.key

	if( req.body.logos ) {
		Object.keys( req.body.logos ).forEach( async key => {
			const logoName = `CapsimInbox_Logo_${key}_${versionKey}`
			const file = req.body.logos[key].file
			const format = req.body.logos[key].fileFormat
			try {
				await fileManager.putFile(file, format, logoName)
			} catch (e) {
				return next(e)
			}
		})
		delete req.body.logos
	}
	//let test = req.body.versionConfig.fileUpload
	let updatedVersion = await new Version({ versionKey }).save(req.body, {patch: true})
	res.status(200).json(updatedVersion)
}))

router.delete('/:key', versionLock, asyncWrap( async( req, res, next ) => {
	let version = await new Version({ versionKey: req.params.key })
						.fetch({ withRelated: ['versionToSim'] })
	if(!version.reportComponents ) version.reportComponents = {}
	if( version.versionToSim.length > 0 ) return res.status(400).json({ success: false })
	await version.destroy()
	res.status(200).json({ success: true })
}))

module.exports = router
