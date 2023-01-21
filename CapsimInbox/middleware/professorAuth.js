const PortalData = require('../services/portalData')
const rd = require('../services/reportData')
const db = require('../services/db')
const Skill = require('../resources/skill')
const VersionToSim = require('../resources/versionToSim')
const Competency = require('../resources/competency')

module.exports = async (req, res, next) => {

    // Redirect if there is no session
    if ( !req.session.data ) return res.redirect(`http://${process.env.API_WW3_HOSTNAME}/login/?logout=1`)
    let { simKey } = req.session.data
    const version = await new VersionToSim({ simKey }).fetch()
    const courseInfo = await PortalData.getCourseInfo(simKey) 

    let simQuestionGroupArr = (version.get('versionKey') == 70)? await rd.getExamQuestionGroupsArrayBySimkey(simKey)
        : await db('CapsimInbox').select('questionGroupKey').from('inbox_questionGroup').where('FK_versionKey' , version.get('versionKey')).map(row => row.questionGroupKey)

    const simMeasurementKeys       = await rd.getMeasurementKeysFromQuestionGroups(simQuestionGroupArr)
    const simSkillKeyArr           = [...new Set(simMeasurementKeys.map(row => row.FK_skillKey))] 
    const simCompetencyKeyArr      = [...new Set(simMeasurementKeys.map(row => row.FK_competencyKey))]
    
    const { isExam, professorSurveyLink, timer } = await PortalData.getVersionInfo( version.get('versionKey') ) 
    let skills = await Skill.where('skillKey','in', simSkillKeyArr ).fetchAll()
    let competencies = await Competency.where( 'competencyKey', 'in', simCompetencyKeyArr).fetchAll()

  
	// No idea where isExam is set in session, someone please find where that is set in the session and merge the two later 
    Object.assign(
        req.session.data,
        courseInfo,
        {
            competencies,
            versionKey: version.get('versionKey'),
            isExam: isExam,
            timer,
            professorSurveyLink: professorSurveyLink,
            skills: skills.toJSON(),
            portalUrl: process.env.API_WW2_HOSTNAME,
            assetsPath: process.env.ASSETS_URL
        }
    )

    next()
}
