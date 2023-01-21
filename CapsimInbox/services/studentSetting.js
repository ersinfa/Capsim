var db = require('./db.js');
StudentSetting = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( StudentSetting.prototype, {

  /**
  * Provides student settings data for a group of students
  *
  * @param {Array} [FK_studentToSimKeyArr]
  *
  * @returns {Object}
  */
 async getSettingsList( FK_studentToSimKeyArr ) {
   
   const temp = await db('CapsimInbox').select(
    'settingJSON',
    'FK_studentToSimKey'
  )
  .from('studentSetting')
  .whereIn('FK_studentToSimKey', FK_studentToSimKeyArr)

  const map = {}
    for (let index = 0; index < temp.length; index++) {
        const key = temp[index].FK_studentToSimKey
        const value = temp[index].settingJSON
        map[key] = value
    }
    return map
},

getSettingsByConfigName(FK_studentToSimKeyArr,configName) {
  return new Promise( async ( resolve, reject ) => {
    try {

      let settingData = await this.getSettings( FK_studentToSimKeyArr )
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
  * Provides student settings data
  *
  * @param {int} [studentToSimKey]
  *
  * @returns {Promise}
  */
  // getSettings( FK_studentToSimKey ) {
  //     let retVal = db('CapsimInbox').select(
  //       'settingJSON',
  //       'FK_studentToSimKey'
  //     )
  //     .from('studentSetting')

  //     if(Array.isArray(FK_studentToSimKey)){
  //       retVal = retVal.whereIn( 'FK_studentToSimKey', FK_studentToSimKey )
  //     } else {
  //       retVal = retVal.where({ FK_studentToSimKey }).first()
  //     }
      
  //     return retVal 
  // },

  getSettings( FK_studentToSimKey ) {
    if(Array.isArray(FK_studentToSimKey)){
      return db('CapsimInbox').select(
        'settingJSON',
        'FK_studentToSimKey'
      )
      .from('studentSetting')
      .whereIn( 'FK_studentToSimKey', FK_studentToSimKey )
    } else {
      return db('CapsimInbox').first(
        'settingJSON'
      )
      .from('studentSetting')
      .where({ FK_studentToSimKey })
    }
    
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
  setPageSettings( FK_studentToSimKey, key, value ){
    return new Promise( ( resolve, reject ) => {
      var configName = 'pages';
      this.setSettings( FK_studentToSimKey, key, value, configName )
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
  setSettings( FK_studentToSimKey, key, value, configName ) {
    return new Promise( async ( resolve, reject ) => {
      try {

        let settingData = await this.getSettings( FK_studentToSimKey )

        if( settingData === undefined ){
          let settingJSON = {}
          settingJSON[configName] = {}
          settingJSON[configName][key] = value

          let data = await this.insertSettings( FK_studentToSimKey, JSON.stringify(settingJSON) )
          resolve(data)
        } else {
          let settingJSON = JSON.parse( settingData.settingJSON );
          if( settingJSON[configName] !== undefined ) settingJSON[configName][key] = value
          else settingJSON[configName] = { [key]: value }

          let data = await this.updateSettings( FK_studentToSimKey, JSON.stringify(settingJSON) )
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
  insertSettings( FK_studentToSimKey, settingJSON ){
    return db('CapsimInbox').insert({
      settingJSON,
      FK_studentToSimKey
    })
    .into('studentSetting')
  },


  /**
  * Updates student settings data
  *
  * @param {int} [studentkey]
  * @param {String} [settingJSON]
  *
  * @returns {Promise}
  */
  updateSettings( FK_studentToSimKey, settingJSON ){
    return db('CapsimInbox')
    .table('studentSetting')
    .where({ FK_studentToSimKey })
    .update({
      settingJSON
    })
  },


})
