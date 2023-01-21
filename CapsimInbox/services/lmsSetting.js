var db = require('./db.js');
const ss = require('../services/studentSetting.js');

LmsSetting = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( LmsSetting.prototype, {

  async isLmsSim( FK_simKey ) {
    const canvasLMSKey = 1

    let hasLmsRecord = await db('Capstone').select('sim.simKey')
      .from(process.env.capstoneDb + 'sim as sim')
      .innerJoin('lti.dbo.ConsumerToSection as cts','cts.FK_sectionKey','sim.sectionkey')
      .innerJoin('lti.dbo.Consumer as c','c.consumerKey','cts.FK_consumerKey')  
      .where({"sim.simkey":FK_simKey, "c.FK_LMSKey" : canvasLMSKey })

    return hasLmsRecord.length > 0
  },

  getLmsUserToTimeMultiplier( FK_simKey ) {
    return db('CapsimInbox').select()
    .from('lms_lmsUserToTimeMultiplier')
    .where({ FK_simKey })
  },
  
  removeLmsUserToTimeMultiplier( {FK_simKey, FK_lmsUserID} ) {
    return db('CapsimInbox').select()
    .from('lms_lmsUserToTimeMultiplier')
    .where({ FK_simKey, FK_lmsUserID })
    .del()
  },

  setLmsUserToTimeMultiplier( {FK_simKey, FK_lmsUserID, timeMultiplier} ) {
    return db('CapsimInbox').insert({
      FK_simKey,
      FK_lmsUserID,
      timeMultiplier
    })
    .into('lms_lmsUserToTimeMultiplier')
  },

  async updateLmsAdaStudentTimer({studentkey,simKey,versionTimer,stsKey}){
    // Check if professor set time multiplier for this sim
    let multiplierRecords = await this.getLmsUserToTimeMultiplier(simKey)
    if(multiplierRecords.length == 0 ) return true;
    
    // Check if student timer set
    let studentSettings = await ss.getSettings(stsKey)
    if (typeof studentSettings !== 'undefined'){
      studentSettings = JSON.parse(studentSettings.settingJSON)
      if(typeof studentSettings.webapp !== 'undefined'){
          if(typeof studentSettings.webapp.data.additionalTime !== 'undefined'){
            return;
          }
      }
  }

    // Check if student exist in lms table
    let simLmsIDArr = multiplierRecords.map( e=> e.FK_lmsUserID)
    let hasLmsRecord = await db('CapsimInbox').select('csi.sisid')
    .from('lti.dbo.ConsumerToCapsimUser as ctcu')
    .innerJoin('lti.dbo.UserType as ut', 'ut.userTypeKey', 'ctcu.FK_userTypeKey')    
    .innerJoin('lti.dbo.ConsumerSisID as csi', 'csi.consumerUserKeyForLMS', 'ctcu.consumerUserKeyForLMS')    
    .where({"ut.userKeyColumn":'studentKey', "ctcu.FK_userKey" : studentkey })
    .whereIn("csi.sisID", simLmsIDArr)
    if(hasLmsRecord.length == 0 ) return ;

    // set new student exam time
    let timerToMultiply = versionTimer
    let sectionSetting = await db('CapsimInbox').first('ss.settingJSON').from('inbox_sectionSetting AS ss').innerJoin(process.env.capstoneDb + 'sim AS s', 's.sectionKey', 'ss.fk_sectionKey').where( {'s.simkey':simKey})
    if (typeof sectionSetting !== 'undefined'){
        let data = JSON.parse(sectionSetting.settingJSON)
        if(typeof data.exam !== 'undefined'){
            if(typeof data.exam.data.time !== 'undefined'){
              timerToMultiply = data.exam.data.time
            }
        }
    }
    let timeMultiplier = multiplierRecords.find(e=> e.FK_lmsUserID == hasLmsRecord[0].sisid).timeMultiplier
    let newTime = timerToMultiply * timeMultiplier
    let newStudentSettings = {}
    if (typeof studentSettings !== 'undefined'){
      newStudentSettings = studentSettings
      
      if(typeof newStudentSettings.webapp !== 'undefined') studentSettings.webapp.data.additionalTime = newTime
      else newStudentSettings.webapp = {"data":{"additionalTime":newTime}}
      
      await db('CapsimInbox').table('studentSetting').where({ FK_studentToSimKey:stsKey }).update({settingJSON:JSON.stringify(newStudentSettings)})

    }else{
      newStudentSettings = {'webapp':{"data":{"additionalTime":newTime}}}
      await db('CapsimInbox').insert({settingJSON:JSON.stringify(newStudentSettings),FK_studentToSimKey : stsKey}).into('studentSetting')
    }

    return true
  }

  


})
