const sr = require('../services/studentReport.js')
const ss = require('../services/studentSetting.js')
const rd = require('../services/reportData.js')
const pd = require('../services/portalData.js')
const Version = require('../resources/version')

module.exports = async ( req, res, next ) => {

    // Redirect to logout if there is no session
    
    if ( !req.session.data && !req.session.isNewRegistration ) return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)

    const report = await sr.buildReport( req.session.stsKey, req.session.versionKey )
    const version = await Version.where({ versionKey: req.session.versionKey }).fetch()
    const allAssessments = await pd.getAllAssessments( req.session.studentkey, req.session.sectionkey)
    const setting = await ss.getSettings( req.session.stsKey )
    
    let FK_MeasurementTypeKey = 1
    let params = {
      "where":{
        "FK_versionKey": req.session.versionKey
      }
    }
  
    req.data = {
        assetsPath: process.env.ASSETS_URL,
        skills: await rd.getMeasurement(FK_MeasurementTypeKey, params),
        settings: (setting !== undefined) ? JSON.parse(setting.settingJSON) : {},
        session: req.session.data,
        surveyLink: version.get('surveyLink'),
        versionKey: req.session.versionKey,
        selectedStsKey: req.session.stsKey,
        report,
        allAssessments
    }

    next()
}
