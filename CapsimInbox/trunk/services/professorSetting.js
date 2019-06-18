var db = require('./db.js');
StudentSetting = function( data ) { return Object.assign( this, data ) }

module.exports = Object.assign( StudentSetting.prototype, {


  /**
  * Provides student settings data
  *
  * @param {int} [professorKey]
  *
  * @returns {Promise}
  */
  getSettings( FK_professorKey ) {
    return db('CapsimInbox').first(
      'settingJSON'
    )
    .from('professorSetting')
    .where({ FK_professorKey })
  },


  /**
  * Inserts or updates professor setting data
  *
  * @param {int} [FK_professorKey]
  * @param {String} [key]
  * @param {String} [value]
  * @param {String} [configName]
  *
  * @returns {Promise}
  */
 setSettings( FK_professorKey, key, value, configName ) {
  return new Promise( async ( resolve, reject ) => {
    try {

      let settingData = await this.getSettings( FK_professorKey )

      if( settingData === undefined ){
        let settingJSON = {}
        settingJSON[configName] = {}
        settingJSON[configName][key] = value

        let data = await this.insertSettings( FK_professorKey, JSON.stringify(settingJSON) )
        resolve(data)
      } else {
        let settingJSON = JSON.parse( settingData.settingJSON );
        if( settingJSON[configName] !== undefined ) settingJSON[configName][key] = value
        else settingJSON[configName] = { [key]: value }

        let data = await this.updateSettings( FK_professorKey, JSON.stringify(settingJSON) )
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
  * @param {int} [professorKey]
  * @param {String} [settingJSON]
  *
  * @returns {Promise}
  */
  insertSettings( FK_professorKey, settingJSON ){
    return db('CapsimInbox').insert({
      settingJSON,
      FK_professorKey
    })
    .into('professorSetting')
  },


  /**
  * Updates student settings data
  *
  * @param {int} [professorKey]
  * @param {String} [settingJSON]
  *
  * @returns {Promise}
  */
  updateSettings( FK_professorKey, settingJSON ){
    return db('CapsimInbox')
    .table('professorSetting')
    .where({ FK_professorKey })
    .update({
      settingJSON
    })
  },


})
