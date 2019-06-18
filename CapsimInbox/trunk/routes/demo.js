const router = require('express').Router()
const asyncWrap = require('../middleware/asyncWrap')
const GameData = require('../services/gameData')
const Role = require('../resources/role')
const nodemailer = require('../lib/mailer')
const Version = require('../resources/version')
const game = require('../services/gameData')
const constants = require('../services/constants.js')
const crypto = require('crypto'),
      algorithm = 'aes-256-ctr',
      password = 'd6F3Efeq'

function decrypt(text){
  const decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

router.get('/data', asyncWrap( async ( req, res, next ) => {
    const data = await game.buildSimulationData(null, null, req.session.versionKey)
    res.status(200).json(data);
}))

router.get('/welcome', asyncWrap( async( req, res, next ) => {

    if( req.query.qv ) {
        const versionKey = decrypt(req.query.qv).split('.')[1]
        req.session.versionKey = versionKey
        const version = await Version.where({ versionKey: req.session.versionKey }).fetch()
        const role = await Role.where({ FK_versionKey: versionKey }).fetch()
        const data = await GameData.buildSimulationData(null, null, versionKey)
        const assetsPath = process.env.ASSETS_URL
        const assessmentTypeKey = constants.ASSESSMENT_TYPE_KEY.DEMO
        res.render('demo/index', { layout: 'assessmentlayout', data: JSON.stringify(Object.assign(data, { role, assetsPath, versionKey, assessmentTypeKey, isExam:version.get('isExam') })) })
        // res.render('demo/index', { layout: 'demo/demoLayout', data: JSON.stringify(Object.assign(data, { role, assetsPath, versionKey })) })
    }
    else return res.render('demo/error', { layout: false })
}))

router.post('/set-user', ( req, res, next ) => {
    userData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        school: req.body.school
    }
    req.session.user = userData
    res.status(200).json(userData)
})

router.post('/send-mail', asyncWrap( async (req, res, next ) => {

    const version = await Version.where({ versionKey: req.session.versionKey }).fetch()
    const data = Object.assign({}, req.session.user, { versionName: version.get('versionName') }, req.body)

    res.render('demo/email', { layout: false, data }, ( err, html ) => {
        let mailOptions = {
            from: 'inbox@capsim.com',
            to: version.get('demoEmail'),
            subject: 'Demo Completed',
            html: html
        };

        nodemailer.sendMail(mailOptions, (error, info) => {
            if (error) return console.log(error);
            res.status(200).end()
        })
    })
}))

router.get('*', asyncWrap( async (req, res, next ) => {
    if( req.session.versionKey ) {

        const version = await Version.where({ versionKey: req.session.versionKey }).fetch()
        const versionKey = (req.query.qv) ? req.query.qv : req.session.versionKey
        const role = await Role.where({ FK_versionKey: versionKey }).fetch()
        const data = await GameData.buildSimulationData(null, null, versionKey)
        const assetsPath = process.env.ASSETS_URL
        const assessmentTypeKey = constants.ASSESSMENT_TYPE_KEY.DEMO
        res.render('demo/index', { layout: 'assessmentlayout', data: JSON.stringify(Object.assign(data, { role, assetsPath, versionKey, assessmentTypeKey, isExam:version.get('isExam') })) })
        // res.render('demo/index', { layout: 'demo/demoLayout', data: JSON.stringify(Object.assign(data, { role, assetsPath, versionKey })) })
    }
    else return res.render('demo/error', { layout: false })
}))

module.exports = router
