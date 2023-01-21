// Fix later, stole the studentSettings file, will fix later.

const db = require('./db.js')
const pd = require('./portalData.js')
SectionSetting = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( SectionSetting.prototype, {


  /**
  * Provides student settings data
  *
  * @param {int} [studentToSimKey]
  *
  * @returns {Promise}
  */
  getSettings(FK_simKey) {
    return db('Capstone').first('settingJSON')
    .from('simSettings')
    .where({ FK_simKey })
  },


  getSettingsByConfigName(FK_simKey,configName) {
    return new Promise( async ( resolve, reject ) => {
      try {

        let settingData = await this.getSettings( FK_simKey )
        retVal = {}
        if( settingData !== undefined ){
          let settingJSON = JSON.parse( settingData.settingJSON );
          if( settingJSON[configName] !== undefined ) retVal = settingJSON[configName]
        }
        resolve(retVal)
      } catch (e) {
        reject(e)
      }
    })

  },
  /**
  * Inserts or updates student setting data related to enabling/disabling student portal menu items
  *
  * @param {int} [studentToSimKey]
  * @param {String} [key]
  * @param {String} [value]
  *
  * @returns {Promise}
  */
  setPageSettings( FK_simKey, key, value ){
    return new Promise( ( resolve, reject ) => {
      var configName = 'pages';
      this.setSettings( FK_simKey, key, value, configName )
      .then( data => resolve( data ) )
      .catch( err => reject( err ) );
    })
  },


  /**
  * Inserts or updates student setting data
  *
  * @param {int} [studentToSimKey]
  * @param {String} [key]
  * @param {String} [value]
  * @param {String} [configName]
  *
  * @returns {Promise}
  */
  setSettings( FK_simKey, key, value, configName ) {
    return new Promise( async ( resolve, reject ) => {
      try {

        let settingData = await this.getSettings( FK_simKey )

        if( settingData === undefined ){
          let settingJSON = {}
          settingJSON[configName] = {}
          settingJSON[configName][key] = value

          let data = await this.insertSettings( FK_simKey, JSON.stringify(settingJSON) )
          resolve(data)
        } else {
          let settingJSON = JSON.parse( settingData.settingJSON );
          if( settingJSON[configName] !== undefined ) settingJSON[configName][key] = value
          else settingJSON[configName] = { [key]: value }

          let data = await this.updateSettings( FK_simKey, JSON.stringify(settingJSON) )
          resolve(data)
        }
      } catch (e) {
        reject(e)
      }
    })

  },


  /**
  * Inserts student settings data
  *
  * @param {int} [studentkey]
  * @param {String} [settingJSON]
  *
  * @returns {Promise}
  */
  insertSettings( FK_simKey, settingJSON ){
    return db('Capstone').insert({
      settingJSON,
      FK_simKey
    })
    .into('simSettings')
  },


  /**
  * Updates student settings data
  *
  * @param {int} [studentkey]
  * @param {String} [settingJSON]
  *
  * @returns {Promise}
  */
  updateSettings( FK_simKey, settingJSON ){
    return db('Capstone')
    .table('simSettings')
    .where({ FK_simKey })
    .update({
      settingJSON
    })
  },

  // Use session data to reduce round trips to get default times from the database
  async getExamSettings (sessionData) {
    let result = {}
    const settings = await this.getSettings(sessionData.simKey)

    if(settings !== undefined){
      let temp = JSON.parse(settings.settingJSON)
      if(temp.exam !== undefined) {
        result = temp.exam.data
      }
    }

    // Default dashboard access settings to start/end date
    if (result.dashboardAccess !== undefined ) {
      // Convert saved est time to local
      const { accessStartDate, accessEndDate } = result.dashboardAccess
      const startDateTime = accessStartDate
      const endDateTime = accessEndDate
      const localTime = await pd.convertESTToLocal(startDateTime, endDateTime, sessionData.sectionkey)
      result.dashboardAccess = {
        accessStartDate: localTime.startDateTime,
        accessEndDate: localTime.endDateTime
      }
    } else {
      result.dashboardAccess = {
        accessStartDate: sessionData.localClassStartDate,
        accessEndDate: sessionData.localClassEndDate
      }
    }
    // Default additionalTime to version timer
		if (result.time === undefined || result.time === null) {
      result.time = sessionData.timer
    }
    return result
  }
})
