const router = require('express').Router()
const game = require('../services/gameData');
const asyncWrap = require('../middleware/asyncWrap')
const Version = require('../resources/version')
const Info = require('../services/info')
const constants = require('../services/constants.js')

router.get('/data', asyncWrap( async ( req, res, next ) => {
    
    const version = await Version.where({ versionKey: req.session.versionKey }).fetch()
    req.session.rehearsalVersionKey = ( version.has('rehearsalVersionKey') ) ? version.get('rehearsalVersionKey') : 36
    game.buildSimulationData(null, null,  req.session.rehearsalVersionKey)
    .then( data => {
        data.assessmentTypeKey = constants.ASSESSMENT_TYPE_KEY.REHEARSAL
        res.status(200).json( data ) 
    })
    .catch( err => res.status(400).json(err) )
}))

router.get('*', asyncWrap( async ( req, res, next ) => {
    if( typeof req.session.rehearsalVersionKey == 'undefined'){
        const version = await Version.where({ versionKey: req.session.versionKey }).fetch()
        req.session.rehearsalVersionKey = ( version.has('rehearsalVersionKey') ) ? version.get('rehearsalVersionKey') : 36
    }
    
    const data = { 
        userData: req.session.data, 
        assetsPath: process.env.ASSETS_URL, 
        versionKey: req.session.rehearsalVersionKey,
        info:Info(req.session.isExam),
        isExam: req.session.isExam,
        assessmentTypeKey: constants.ASSESSMENT_TYPE_KEY.REHEARSAL
    }
    res.render('assessmentlayout', { layout: false, data: JSON.stringify(data) });
    // res.render('rehearsal', { layout: false, data: JSON.stringify(data) });
}))



module.exports = router
